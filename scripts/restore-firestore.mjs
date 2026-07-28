/**
 * Restore a backup written by backup-firestore.mjs.
 *
 * A backup nobody has restored is a guess, not a backup — so this exists, and
 * `--check` verifies a file end to end without writing anything.
 *
 *   node scripts/restore-firestore.mjs --check                    # verify newest
 *   node scripts/restore-firestore.mjs --check <file>             # verify one
 *   node scripts/restore-firestore.mjs --apply <file> <collection>
 *
 * Restoring is deliberately narrow: one named collection at a time, and it
 * overwrites documents by id. There is no "restore everything" switch, because
 * running that against a live site by accident is worse than the outage.
 */
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { readdirSync, readFileSync, existsSync } from "fs";
import { join } from "path";

const DIR = "backups";
const args = process.argv.slice(2);
const apply = args.includes("--apply");

function newest() {
  if (!existsSync(DIR)) return null;
  const files = readdirSync(DIR).filter((f) => f.endsWith(".json")).sort();
  return files.length ? join(DIR, files[files.length - 1]) : null;
}

const file = args.find((a) => a.endsWith(".json")) ?? newest();
if (!file || !existsSync(file)) {
  console.error("No backup file found. Run backup-firestore.mjs first.");
  process.exit(1);
}

const dump = JSON.parse(readFileSync(file, "utf8"));
const names = Object.keys(dump.collections ?? {});

console.log(`file:    ${file}`);
console.log(`taken:   ${dump.takenAt}`);
console.log(`content: ${names.length} collection(s)\n`);
for (const n of names) console.log(`  ${n.padEnd(18)} ${dump.collections[n].length}`);

if (!apply) {
  // sanity: every document must have an id and an object payload
  let bad = 0;
  for (const n of names) {
    for (const d of dump.collections[n]) {
      if (!d.id || typeof d.data !== "object" || d.data === null) bad++;
    }
  }
  console.log(
    bad === 0
      ? "\nCheck passed — every document has an id and a payload."
      : `\nCheck FAILED — ${bad} malformed document(s).`,
  );
  process.exit(bad === 0 ? 0 : 1);
}

const target = args.find((a) => names.includes(a));
if (!target) {
  console.error(
    `\n--apply needs a collection name. One of: ${names.join(", ")}`,
  );
  process.exit(1);
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

/** Put back what `plain()` unwrapped when the backup was written. */
function revive(value) {
  if (value === null || typeof value !== "object") return value;
  if (typeof value.__timestamp === "string") {
    return Timestamp.fromDate(new Date(value.__timestamp));
  }
  if (Array.isArray(value)) return value.map(revive);
  const out = {};
  for (const [k, v] of Object.entries(value)) out[k] = revive(v);
  return out;
}

const docs = dump.collections[target];
console.log(`\nRestoring ${docs.length} document(s) into "${target}"...`);
let n = 0;
for (const d of docs) {
  await db.collection(target).doc(d.id).set(revive(d.data));
  n++;
}
console.log(`done — ${n} document(s) written`);
process.exit(0);
