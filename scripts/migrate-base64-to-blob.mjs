/**
 * Move base64 images out of Firestore and onto Vercel Blob.
 *
 * Images stored as `data:image/...;base64,...` can't go through next/image —
 * there's no URL for the optimizer to fetch, so every visitor downloads the
 * full original. This uploads each one to Blob and rewrites the field to the
 * returned URL, which makes them optimizable and shrinks the Firestore docs.
 *
 * Covers the hotel cover image (`hotels/{id}.image`) and the gallery
 * (`hotelMedia/{id}.images[]`), plus any legacy inline gallery still on the
 * hotel doc.
 *
 * DRY RUN BY DEFAULT — it reports what it would do and changes nothing.
 * Pass --apply to actually upload and write.
 *
 *   node scripts/migrate-base64-to-blob.mjs            # report only
 *   node scripts/migrate-base64-to-blob.mjs --apply    # do it
 *
 * Needs, in the project root:
 *   - a firebase-adminsdk service-account .json
 *   - BLOB_READ_WRITE_TOKEN, in the environment or in .env.local
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { put } from "@vercel/blob";
import { readdirSync, readFileSync, existsSync, appendFileSync } from "fs";

const APPLY = process.argv.includes("--apply");
const LOG = "migrate-base64-to-blob.log";

// ---------- credentials ----------

const saFile = readdirSync(".").find(
  (n) => n.includes("firebase-adminsdk") && n.endsWith(".json"),
);
if (!saFile) {
  console.error("No firebase-adminsdk *.json in the project root — aborting.");
  process.exit(1);
}

/** Read BLOB_READ_WRITE_TOKEN from the env, else from .env.local. */
function blobToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) return process.env.BLOB_READ_WRITE_TOKEN;
  for (const file of [".env.local", ".env"]) {
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]*READ_WRITE_TOKEN)\s*=\s*"?([^"\s]+)"?/);
      if (m && m[2].startsWith("vercel_blob_")) return m[2];
    }
  }
  return undefined;
}

const TOKEN = blobToken();
if (APPLY && !TOKEN) {
  console.error("No BLOB_READ_WRITE_TOKEN found (env or .env.local) — aborting.");
  process.exit(1);
}

if (!getApps().length) initializeApp({ credential: cert(saFile) });
const db = getFirestore();

// ---------- helpers ----------

const isBase64 = (s) => typeof s === "string" && s.startsWith("data:");

const EXT = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

/** Decode a data: URL into a Buffer plus its content type. */
function decode(dataUrl) {
  const m = dataUrl.match(/^data:([^;,]+)(;base64)?,(.*)$/s);
  if (!m) return null;
  const [, contentType, isB64, payload] = m;
  const buf = isB64
    ? Buffer.from(payload, "base64")
    : Buffer.from(decodeURIComponent(payload), "utf8");
  return { buf, contentType };
}

/**
 * Stash a doc's original field before overwriting it. Rewriting `image` throws
 * the base64 away, and there is no other copy — so keep one, in its own
 * collection, until the migration is confirmed good.
 */
async function backup(path, before) {
  await db
    .collection("_migrationBackup")
    .doc(path.replace(/\//g, "__"))
    .set({ path, before, at: Date.now() });
}

const kb = (n) => Math.round(n / 1024);
let uploaded = 0;
let bytesSaved = 0;
const failures = [];

/** Upload one data: URL and return its Blob URL, or null to leave it alone. */
async function toBlob(dataUrl, name) {
  const dec = decode(dataUrl);
  if (!dec) {
    failures.push(`${name}: could not decode`);
    return null;
  }
  const { buf, contentType } = dec;
  const ext = EXT[contentType] || "bin";
  if (!EXT[contentType]) {
    failures.push(`${name}: unsupported type ${contentType}`);
    return null;
  }

  if (!APPLY) {
    console.log(`  would upload ${name} — ${kb(buf.length)} KB (${contentType})`);
    uploaded++;
    bytesSaved += buf.length;
    return null;
  }

  try {
    const res = await put(`${name}.${ext}`, buf, {
      access: "public",
      contentType,
      addRandomSuffix: true,
      token: TOKEN,
    });
    console.log(`  uploaded ${name} — ${kb(buf.length)} KB -> ${res.url}`);
    appendFileSync(LOG, `${name}\t${kb(buf.length)}KB\t${res.url}\n`);
    uploaded++;
    bytesSaved += buf.length;
    return res.url;
  } catch (e) {
    failures.push(`${name}: upload failed — ${e?.message ?? e}`);
    return null;
  }
}

// ---------- migrate ----------

console.log(
  APPLY
    ? "APPLYING — uploading to Blob and rewriting Firestore.\n"
    : "DRY RUN — nothing will be changed. Re-run with --apply to do it.\n",
);

const hotels = await db.collection("hotels").get();
console.log(`${hotels.size} hotels\n`);

for (const doc of hotels.docs) {
  const h = doc.data();
  const label = h.name || doc.id;
  const patch = {};

  // 1) cover image on the hotel doc
  if (isBase64(h.image)) {
    console.log(`${label} — cover`);
    const url = await toBlob(h.image, `hotels/${doc.id}/cover`);
    if (url) patch.image = url;
  }

  // 2) legacy inline gallery still on the hotel doc
  if (Array.isArray(h.images) && h.images.some(isBase64)) {
    console.log(`${label} — legacy inline gallery (${h.images.length})`);
    const next = [];
    for (let i = 0; i < h.images.length; i++) {
      const src = h.images[i];
      if (!isBase64(src)) {
        next.push(src);
        continue;
      }
      const url = await toBlob(src, `hotels/${doc.id}/legacy-${i}`);
      next.push(url ?? src);
    }
    if (APPLY) patch.images = next;
  }

  if (APPLY && Object.keys(patch).length) {
    const before = {};
    for (const k of Object.keys(patch)) before[k] = h[k];
    await backup(`hotels/${doc.id}`, before);
    await doc.ref.update(patch);
    console.log(`  wrote ${Object.keys(patch).join(", ")} on hotels/${doc.id}`);
  }

  // 3) the gallery in hotelMedia
  const mediaRef = db.collection("hotelMedia").doc(doc.id);
  const media = await mediaRef.get();
  if (!media.exists) continue;
  const images = media.data()?.images;
  if (!Array.isArray(images) || !images.some(isBase64)) continue;

  console.log(`${label} — gallery (${images.length})`);
  const next = [];
  for (let i = 0; i < images.length; i++) {
    const src = images[i];
    if (!isBase64(src)) {
      next.push(src);
      continue;
    }
    const url = await toBlob(src, `hotels/${doc.id}/gallery-${i}`);
    next.push(url ?? src);
  }
  if (APPLY) {
    await backup(`hotelMedia/${doc.id}`, { images });
    await mediaRef.update({ images: next });
    console.log(`  wrote images on hotelMedia/${doc.id}`);
  }
}

// ---------- report ----------

console.log(
  `\n${APPLY ? "Uploaded" : "Would upload"} ${uploaded} image(s), ` +
    `${kb(bytesSaved)} KB out of Firestore.`,
);
if (failures.length) {
  console.log(`\n${failures.length} left untouched:`);
  for (const f of failures) console.log(`  - ${f}`);
}
if (APPLY && uploaded) console.log(`\nURLs logged to ${LOG}`);
if (!APPLY && uploaded) console.log("\nRe-run with --apply to perform it.");

process.exit(0);
