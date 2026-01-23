import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(), // Using email as username
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"), // 'customer' | 'admin'
  name: text("name").notNull(),
  phone: text("phone"),
  address: text("address"),
  profilePhotoUrl: text("profile_photo_url"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  hindiName: text("hindi_name"),
  description: text("description"),
  price: integer("price").notNull(), // Stored in lowest currency unit (e.g. paise/cents) or just number
  category: text("category").notNull(), // 'Tea', 'Coffee', 'Snacks'
  imageUrl: text("image_url").notNull(),
  ingredients: text("ingredients"),
  weight: text("weight"),
  stock: integer("stock").notNull().default(0),
  isBestSeller: boolean("is_best_seller").default(false),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'delivered', 'cancelled'
  totalAmount: integer("total_amount").notNull(),
  paymentMethod: text("payment_method").notNull().default("UPI"),
  paymentStatus: text("payment_status").notNull().default("pending_verification"), // 'pending_verification', 'paid', 'failed'
  paymentDetails: jsonb("payment_details"), // Store UPI transaction info if needed
  deliveryAddress: text("delivery_address").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  priceAtTime: integer("price_at_time").notNull(),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  name: true,
  phone: true,
  address: true,
  profilePhotoUrl: true
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
