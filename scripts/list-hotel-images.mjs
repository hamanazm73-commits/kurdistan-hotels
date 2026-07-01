/**
 * Diagnostic: list all hotel names + image URLs so we can spot broken ones.
 * Run:  node scripts/list-hotel-images.mjs
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

async function run() {
  const snap = await db.collection("hotels").get();
  for (const doc of snap.docs) {
    const { name, image } = doc.data();
    console.log(`"${name}"\n  ${image || "(empty)"}\n`);
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
