/**
 * One-time migration: add Kurmanji (kmr) hotel name translations to all
 * existing Firestore hotel documents.
 *
 * Run:  node scripts/add-kmr-names.mjs
 */

import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const serviceAccount = JSON.parse(
  readFileSync(
    new URL(
      "../hotel-dukan-2-c5dac-firebase-adminsdk-fbsvc-d26782f173.json",
      import.meta.url
    ),
    "utf8"
  )
);

initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

/** Map of English base name -> Kurmanji translation */
const KMR_NAMES = {
  "Grand Dukan Lake Resort": "Rezorta Mezin a Golê ya Dûkanê",
  "Erbil Citadel Hotel": "Otêla Qelay Hewlêrê",
  "Sulaymaniyah Palace": "Qesra Silêmaniyê",
  "Halabja Garden Inn": "Mêvanxaneya Baxçeyê ya Helebceyê",
  "Duhok Heights Hotel": "Otêla Bilindahiyên Duhokê",
  "Kirkuk Baba Gurgur Hotel": "Otêla Baba Gurgurê ya Kerkûkê",
};

async function run() {
  const snap = await db.collection("hotels").get();
  let updated = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const kmr = KMR_NAMES[data.name];
    if (!kmr) {
      console.log(`⏭  skipped (no kmr mapping): "${data.name}"`);
      continue;
    }
    const existing = data.nameI18n?.kmr;
    if (existing) {
      console.log(`✅ already has kmr: "${data.name}" → "${existing}"`);
      continue;
    }
    await docSnap.ref.update({ "nameI18n.kmr": kmr });
    console.log(`✏️  updated: "${data.name}" → "${kmr}"`);
    updated++;
  }

  console.log(`\nDone. ${updated} document(s) updated.`);
}

run().catch((e) => { console.error(e); process.exit(1); });
