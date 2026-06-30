/**
 * One-time migration: multiply all USD-scale prices (< 1,000) by 1,000
 * to convert them to IQD in every hotel document.
 *
 * Safe to re-run: documents already at IQD scale (>= 1,000) are skipped.
 *
 * Run:  node scripts/migrate-prices-to-iqd.mjs
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

function needsUpgrade(price) {
  return typeof price === "number" && price > 0 && price < 1000;
}

async function run() {
  const snap = await db.collection("hotels").get();
  let updated = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const updates = {};

    // Main price
    if (needsUpgrade(data.price)) {
      updates.price = data.price * 1000;
    }

    // Room prices
    if (Array.isArray(data.rooms)) {
      const newRooms = data.rooms.map((r) => ({
        ...r,
        price: needsUpgrade(r.price) ? r.price * 1000 : r.price,
      }));
      const changed = newRooms.some((r, i) => r.price !== data.rooms[i].price);
      if (changed) updates.rooms = newRooms;
    }

    // Discount prices
    if (data.discount) {
      const d = data.discount;
      const newDiscount = { ...d };
      let discountChanged = false;
      if (needsUpgrade(d.oldPrice)) { newDiscount.oldPrice = d.oldPrice * 1000; discountChanged = true; }
      if (needsUpgrade(d.newPrice)) { newDiscount.newPrice = d.newPrice * 1000; discountChanged = true; }
      if (discountChanged) updates.discount = newDiscount;
    }

    if (Object.keys(updates).length > 0) {
      await docSnap.ref.update(updates);
      const priceStr = updates.price ? `${data.price} → ${updates.price}` : `${data.price} (ok)`;
      console.log(`✏️  ${data.name}: price ${priceStr}`);
      updated++;
    } else {
      console.log(`⏭  skipped (already IQD): ${data.name} = ${data.price.toLocaleString()}`);
    }
  }

  console.log(`\nDone. ${updated} hotel(s) updated.`);
}

run().catch((e) => { console.error(e); process.exit(1); });
