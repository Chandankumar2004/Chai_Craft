import { db } from "./db";
import { promos, giftCards } from "../shared/schema";

async function seed() {
  console.log("Seeding promo codes and gift cards...");
  
  await db.insert(promos).values([
    { code: "CHAI10", type: "percentage", value: 10, minOrderAmount: 100, isActive: true },
    { code: "WELCOME20", type: "fixed", value: 20, minOrderAmount: 50, isActive: true },
    { code: "CHAI100", type: "percentage", value: 5, minOrderAmount: 100, isActive: true },
    { code: "CHAI200", type: "percentage", value: 6, minOrderAmount: 200, isActive: true },
    { code: "CHAI300", type: "fixed", value: 35, minOrderAmount: 300, isActive: true },
    { code: "CHAI500", type: "fixed", value: 50, minOrderAmount: 500, isActive: true }
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
