/**
 * Export every Firestore collection to a timestamped JSON file.
 *
 * Everything the business runs on — hotels, bookings, reviews, settings — lives
 * in one Firestore project with no copy anywhere else. A mistaken script or a
 * deleted document is unrecoverable, and this repo already carries scripts that
 * delete things.
 *
 *   node scripts/backup-firestore.mjs              # write a backup
 *   node scripts/backup-firestore.mjs --list       # show existing backups
 *
 * Backups land in ./backups (gitignored — they hold guest names and phone
 * numbers and must never be committed).
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { readdirSync, mkdirSync, writeFileSync, existsSync, statSync } from "fs";
import { join } from "path";

const DIR = "backups";
/** Keep this many most recent backups; older ones are pruned. */
const KEEP = 14;

if (process.argv.includes("--list")) {
  if (!existsSync(DIR)) {
    console.log("no backups yet");
    process.exit(0);
  }
  const files = readdirSync(DIR).filter((f) => f.endsWith(".json")).sort();
  for (const f of files) {
    const kb = Math.round(statSync(join(DIR, f)).size / 1024);
    console.log(`${f}  ${kb} KB`);
  }
  console.log(`\n${files.length} backup(s)`);
  process.exit(0);
}

const saFile = readdirSync(".").find(
  (n) => n.includes("firebase-adminsdk") && n.endsWith(".json"),
);
if (!saFile) {
  console.error("No firebase-adminsdk *.json in the project root — aborting.");
  process.exit(1);
}
if (!getApps().length) initializeApp({ credential: cert(saFile) });
const db = getFirestore();

/** Firestore Timestamps and other class instances don't survive JSON on their
    own; unwrap the ones we actually store so a restore reads them back. */
function plain(value) {
  if (value === null || typeof value !== "object") return value;
  if (typeof value.toDate === "function") {
    return { __timestamp: value.toDate().toISOString() };
  }
  if (Array.isArray(value)) return value.map(plain);
  const out = {};
  for (const [k, v] of Object.entries(value)) out[k] = plain(v);
  return out;
}

const collections = await db.listCollections();
const dump = { takenAt: new Date().toISOString(), collections: {} };
let docCount = 0;

for (const col of collections) {
  const snap = await col.get();
  dump.collections[col.id] = snap.docs.map((d) => ({
    id: d.id,
    data: plain(d.data()),
  }));
  docCount += snap.size;
  console.log(`${col.id.padEnd(18)} ${snap.size} doc(s)`);
}

mkdirSync(DIR, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const file = join(DIR, `firestore-${stamp}.json`);
writeFileSync(file, JSON.stringify(dump, null, 2), "utf8");

const kb = Math.round(statSync(file).size / 1024);
console.log(
  `\n${collections.length} collection(s), ${docCount} document(s) -> ${file} (${kb} KB)`,
);

// prune, oldest first, so the folder doesn't grow forever
const kept = readdirSync(DIR).filter((f) => f.endsWith(".json")).sort();
for (const old of kept.slice(0, Math.max(0, kept.length - KEEP))) {
  const { unlinkSync } = await import("fs");
  unlinkSync(join(DIR, old));
  console.log(`pruned ${old}`);
}

process.exit(0);
