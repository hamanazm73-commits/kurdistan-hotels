// One-off: add Kurdish + Arabic names to the seeded sample hotels.
// Run from the project root:  node scripts/update-names.mjs
import { existsSync, readdirSync } from "fs";
import { join } from "path";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const root = process.cwd();
function findServiceAccount() {
  const named = join(root, "service-account.json");
  if (existsSync(named)) return named;
  const m = readdirSync(root).find(
    (n) => n.includes("firebase-adminsdk") && n.endsWith(".json"),
  );
  return m ? join(root, m) : null;
}

const sa = findServiceAccount();
if (!sa) {
  console.error("Service account JSON not found in the project root.");
  process.exit(1);
}

const db = getFirestore(initializeApp({ credential: cert(sa) }));

const NAMES = {
  "Grand Dukan Lake Resort": {
    ckb: "ریزۆرتی دەریاچەی دووکان",
    ar: "منتجع بحيرة دوكان",
  },
  "Erbil Citadel Hotel": {
    ckb: "هۆتێلی قەڵای هەولێر",
    ar: "فندق قلعة أربيل",
  },
  "Sulaymaniyah Palace": {
    ckb: "کۆشکی سلێمانی",
    ar: "قصر السليمانية",
  },
  "Halabja Garden Inn": {
    ckb: "نزڵگەی باخچەی هەڵەبجە",
    ar: "نزل حديقة حلبجة",
  },
  "Duhok Heights Hotel": {
    ckb: "هۆتێلی بەرزاییەکانی دهۆک",
    ar: "فندق مرتفعات دهوك",
  },
  "Kirkuk Baba Gurgur Hotel": {
    ckb: "هۆتێلی بابە گوڕگوڕی کەرکوک",
    ar: "فندق بابا كركر كركوك",
  },
};

const snap = await db.collection("hotels").get();
let updated = 0;
for (const doc of snap.docs) {
  const name = doc.data().name;
  if (NAMES[name]) {
    await doc.ref.update({ nameI18n: NAMES[name] });
    updated++;
    console.log("updated:", name);
  }
}
console.log(`Done. Updated ${updated} hotel(s).`);
process.exit(0);
