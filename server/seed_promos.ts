import { db } from "./db";
import { promos, giftCards } from "../shared/schema";

async function seed() {
  console.log("Seeding promo codes and gift cards...");
  
  await db.insert(promos).values([
    {
      code: "CHAI10",
      type: "percentage",
      value: 10,
      minOrderAmount: 100,
      isActive: true,
    },
    {
      code: "WELCOME20",
      type: "fixed",
      value: 20,
      minOrderAmount: 50,
      isActive: true,
    }
  ]).onConflictDoNothing();

  await db.insert(giftCards).values([
    {
      code: "GIFT-1234",
      balance: 100,
      isActive: true,
    },
    {
      code: "GIFT-5678",
      balance: 500,
      isActive: true,
    }
  ]).onConflictDoNothing();

  console.log("Seeding completed.");
}

seed().catch(console.error);
