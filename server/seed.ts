import { storage } from "./storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seed() {
  const existingUser = await storage.getUserByUsername("admin@chaicraft.com");
  if (existingUser) return;

  const adminPassword = await hashPassword("admin123");
  await storage.createUser({
    username: "admin@chaicraft.com",
    password: adminPassword,
    role: "admin",
    name: "Admin User",
    phone: "9999999999",
    address: "Chai Craft HQ"
  });

  const userPassword = await hashPassword("user123");
  await storage.createUser({
    username: "user@chaicraft.com",
    password: userPassword,
    role: "customer",
    name: "Regular User",
    phone: "8888888888",
    address: "Mumbai, India"
  });

  const products = [
    {
      name: "Masala Chai",
      hindiName: "मसाला चाय",
      description: "Authentic Indian tea spiced with cardamom, ginger, and cloves.",
      price: 2000, // 20.00
      category: "Tea",
      imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=800&q=80",
      ingredients: "Tea leaves, Milk, Sugar, Spices",
      weight: "150ml",
      stock: 100,
      isBestSeller: true
    },
    {
      name: "Ginger Tea",
      hindiName: "अद्रक चाय",
      description: "Fresh ginger tea for a refreshing kick.",
      price: 1500, // 15.00
      category: "Tea",
      imageUrl: "https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=800&q=80",
      ingredients: "Tea leaves, Ginger, Milk",
      weight: "150ml",
      stock: 80,
      isBestSeller: false
    },
    {
      name: "Cappuccino",
      hindiName: "कपुचिनो",
      description: "Rich espresso with steamed milk foam.",
      price: 4500, // 45.00
      category: "Coffee",
      imageUrl: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&q=80",
      ingredients: "Coffee beans, Milk",
      weight: "200ml",
      stock: 50,
      isBestSeller: true
    },
    {
      name: "Samosa",
      hindiName: "समोसा",
      description: "Crispy pastry filled with spiced potatoes and peas.",
      price: 1500, // 15.00
      category: "Snacks",
      imageUrl: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80",
      ingredients: "Flour, Potato, Peas, Spices",
      weight: "2 pcs",
      stock: 200,
      isBestSeller: true
    },
    {
      name: "Bun Maska",
      hindiName: "बन मस्का",
      description: "Soft bun slathered with fresh butter.",
      price: 2500, // 25.00
      category: "Snacks",
      imageUrl: "https://images.unsplash.com/photo-1626074353765-517a681e40be?w=800&q=80",
      ingredients: "Bun, Butter",
      weight: "1 pc",
      stock: 100,
      isBestSeller: false
    }
  ];

  for (const product of products) {
    await storage.createProduct(product);
  }
}
