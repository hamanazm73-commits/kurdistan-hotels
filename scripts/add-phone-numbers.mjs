/**
 * Add sample phone numbers to hotels that don't have one.
 * Run:  node scripts/add-phone-numbers.mjs
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

// Sample Iraqi phone numbers per hotel name
const PHONES = {
  "Grand Dukan Lake Resort": "07701234501",
  "Erbil Citadel Hotel":     "07501234502",
  "Sulaymaniyah Palace":     "07701234503",
  "Halabja Garden Inn":      "07701234504",
  "Duhok Heights Hotel":     "07501234505",
  "Kirkuk Baba Gurgur Hotel":"07701234506",
  "plaza hotel":             "07701234507",
};

async function run() {
  const snap = await db.collection("hotels").get();
  let updated = 0;

  for (const doc of snap.docs) {
    const { name, phone } = doc.data();
    if (phone) {
      console.log(`✅ already has phone: "${name}" → ${phone}`);
      continue;
    }
    const newPhone = PHONES[name];
    if (!newPhone) {
      console.log(`⏭  no mapping for: "${name}"`);
      continue;
    }
    await doc.ref.update({ phone: newPhone });
    console.log(`✏️  added phone: "${name}" → ${newPhone}`);
    updated++;
  }

  console.log(`\nDone. ${updated} updated.`);
}

run().catch((e) => { console.error(e); process.exit(1); });
