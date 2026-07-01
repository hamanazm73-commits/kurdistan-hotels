/**
 * One-time fix: update Plaza Hotel's image to a valid Unsplash URL.
 * Also lists all hotels with empty/missing images so they can be spotted.
 *
 * Run:  node scripts/fix-plaza-image.mjs
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

// A curated map: hotel name substring (lowercase) → Unsplash image URL
const IMAGE_FIXES = {
  plaza: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
};

async function run() {
  const snap = await db.collection("hotels").get();
  let updated = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const name = typeof data.name === "string" ? data.name : "";
    const image = typeof data.image === "string" ? data.image : "";

    // Report empty images
    if (!image) {
      console.log(`⚠️  empty image: "${name}" (id: ${docSnap.id})`);
    }

    // Find a fix for this hotel
    const key = Object.keys(IMAGE_FIXES).find((k) =>
      name.toLowerCase().includes(k)
    );

    if (!key) continue;

    const newUrl = IMAGE_FIXES[key];

    if (image === newUrl) {
      console.log(`✅ already correct: "${name}"`);
      continue;
    }

    console.log(`🔧 fixing "${name}"`);
    console.log(`   old: ${image || "(empty)"}`);
    console.log(`   new: ${newUrl}`);

    await docSnap.ref.update({ image: newUrl });
    updated++;
  }

  console.log(`\nDone. ${updated} document(s) updated.`);
}

run().catch((e) => { console.error(e); process.exit(1); });
