/**
 * Diagnose Firebase Storage: does the bucket exist / is Storage enabled?
 * Run:  node scripts/check-storage.mjs
 */

import { readFileSync } from "fs";
import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const serviceAccount = JSON.parse(
  readFileSync(
    new URL(
      "../hotel-dukan-2-c5dac-firebase-adminsdk-fbsvc-d26782f173.json",
      import.meta.url
    ),
    "utf8"
  )
);

const BUCKET = "hotel-dukan-2-c5dac.firebasestorage.app";

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: BUCKET,
});

async function run() {
  console.log(`Checking bucket: ${BUCKET}\n`);
  try {
    const bucket = getStorage().bucket();
    const [exists] = await bucket.exists();
    if (exists) {
      console.log("✅ Bucket EXISTS — Firebase Storage is enabled.");
      const [files] = await bucket.getFiles({ maxResults: 5 });
      console.log(`   Files in bucket: ${files.length > 0 ? files.map(f => f.name).join(", ") : "(empty)"}`);
      console.log("\n   → If uploads still fail, the problem is the Storage RULES (not published) or auth.");
    } else {
      console.log("❌ Bucket does NOT exist — Firebase Storage is NOT enabled.");
      console.log("   → Go to Firebase Console > Storage > 'Get Started' to enable it.");
    }
  } catch (e) {
    console.log("❌ ERROR reaching bucket:");
    console.log("   " + (e?.message || e));
    if (String(e?.message).includes("does not exist") || e?.code === 404) {
      console.log("\n   → Firebase Storage is NOT enabled. Enable it in the Console.");
    }
  }
}

run().catch((e) => { console.error(e); process.exit(1); });
