import { users, products, orders, orderItems, jobs, messages, promos, giftCards, reviews, jobApplications } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";
import type { InsertUser, InsertProduct, InsertOrder, InsertOrderItem, InsertJob, InsertMessage, Promo, GiftCard, Review, InsertReview, InsertJobApplication } from "@shared/schema";

import session from "express-session";
import createMemoryStore from "memorystore";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  sessionStore: session.Store;
  // Users
  getUser(id: number): Promise<typeof users.$inferSelect | undefined>;
  getUserByUsername(username: string): Promise<typeof users.$inferSelect | undefined>;
  createUser(user: InsertUser): Promise<typeof users.$inferSelect>;
  
  // Products
  getProducts(): Promise<typeof products.$inferSelect[]>;
  getProduct(id: number): Promise<typeof products.$inferSelect | undefined>;
  createProduct(product: InsertProduct): Promise<typeof products.$inferSelect>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<typeof products.$inferSelect>;
  deleteProduct(id: number): Promise<void>;

  // Orders
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<typeof orders.$inferSelect>;
  getOrders(userId?: number): Promise<(typeof orders.$inferSelect & { items: typeof orderItems.$inferSelect[] })[]>;
  getAllOrders(): Promise<(typeof orders.$inferSelect & { user: typeof users.$inferSelect })[]>; // Admin
  updateOrderStatus(id: number, status: string, paymentStatus?: string): Promise<typeof orders.$inferSelect>;

  // Jobs
  getJobs(): Promise<(typeof jobs.$inferSelect)[]>;
  createJob(job: InsertJob): Promise<typeof jobs.$inferSelect>;
  updateJob(id: number, job: Partial<InsertJob>): Promise<typeof jobs.$inferSelect>;
  deleteJob(id: number): Promise<void>;
  
  // Job Applications
  getJobApplications(jobId?: number, userId?: number): Promise<(typeof jobApplications.$inferSelect)[]>;
  createJobApplication(application: InsertJobApplication): Promise<typeof jobApplications.$inferSelect>;
  updateJobApplicationStatus(id: number, status: string): Promise<typeof jobApplications.$inferSelect>;
  deleteJobApplication(id: number): Promise<void>;

  // Messages
  createMessage(message: InsertMessage): Promise<typeof messages.$inferSelect>;

  // Reviews
  getReviewsByProduct(productId: number): Promise<(typeof reviews.$inferSelect & { user: typeof users.$inferSelect })[]>;
  createReview(review: InsertReview): Promise<typeof reviews.$inferSelect>;

  // Promos & Gift Cards
  getPromoByCode(code: string): Promise<Promo | undefined>;
  getGiftCardByCode(code: string): Promise<GiftCard | undefined>;
  updateGiftCardBalance(id: number, balance: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    });
  }

  async getUser(id: number) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser) {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getProducts() {
    return await db.select().from(products);
  }

  async getProduct(id: number) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct) {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>) {
    const [updatedProduct] = await db.update(products).set(product).where(eq(products.id, id)).returning();
    return updatedProduct;
  }

  async deleteProduct(id: number) {
    await db.delete(products).where(eq(products.id, id));
  }

  async createOrder(order: InsertOrder, items: InsertOrderItem[]) {
    // Transaction ideally
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    for (const item of items) {
      await db.insert(orderItems).values({
        ...item,
        orderId: newOrder.id
      });
    }
    return newOrder;
  }

  async getOrders(userId?: number) {
    // Simple implementation - fetch orders then fetch items
    const userOrders = userId 
      ? await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt))
      : await db.select().from(orders).orderBy(desc(orders.createdAt));
    
    // In a real app, use joins or dataloader. For MVP:
    const results = [];
    for (const order of userOrders) {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      results.push({ ...order, items });
    }
    return results;
  }

  async getAllOrders() {
    // For admin
    const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
    const results = [];
    for (const order of allOrders) {
      const [user] = await db.select().from(users).where(eq(users.id, order.userId));
      results.push({ ...order, user });
    }
    return results;
  }

  async updateOrderStatus(id: number, status: string, paymentStatus?: string) {
    const updates: any = { status };
    if (paymentStatus) updates.paymentStatus = paymentStatus;
    
    const [updated] = await db.update(orders).set(updates).where(eq(orders.id, id)).returning();
    return updated;
  }

  async getJobs() {
    return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
  }

  async createJob(job: InsertJob) {
    const [newJob] = await db.insert(jobs).values(job).returning();
    return newJob;
  }

  async updateJob(id: number, job: Partial<InsertJob>) {
    const [updated] = await db.update(jobs).set(job).where(eq(jobs.id, id)).returning();
    return updated;
  }

  async deleteJob(id: number) {
    await db.delete(jobs).where(eq(jobs.id, id));
  }

  async getJobApplications(jobId?: number, userId?: number) {
    if (jobId) {
      return await db.select().from(jobApplications).where(eq(jobApplications.jobId, jobId)).orderBy(desc(jobApplications.createdAt));
    }
    if (userId) {
      return await db.select().from(jobApplications).where(eq(jobApplications.userId, userId)).orderBy(desc(jobApplications.createdAt));
    }
    return await db.select().from(jobApplications).orderBy(desc(jobApplications.createdAt));
  }

  async deleteJobApplication(id: number) {
    await db.delete(jobApplications).where(eq(jobApplications.id, id));
  }

  async createJobApplication(application: InsertJobApplication) {
    const [newApp] = await db.insert(jobApplications).values(application).returning();
    return newApp;
  }

  async updateJobApplicationStatus(id: number, status: string) {
    const [updated] = await db.update(jobApplications).set({ status }).where(eq(jobApplications.id, id)).returning();
    return updated;
  }

  async createMessage(message: InsertMessage) {
    const [newMessage] = await db.insert(messages).values(message).returning();
    return newMessage;
  }

  async getReviewsByProduct(productId: number) {
    const productReviews = await db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt));
    const results = [];
    for (const review of productReviews) {
      const [user] = await db.select().from(users).where(eq(users.id, review.userId));
      results.push({ ...review, user });
    }
    return results;
  }

  async createReview(review: InsertReview) {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  async getPromoByCode(code: string) {
    const [promo] = await db.select().from(promos).where(and(eq(promos.code, code), eq(promos.isActive, true)));
    return promo;
  }

  async getGiftCardByCode(code: string) {
    const [giftCard] = await db.select().from(giftCards).where(and(eq(giftCards.code, code), eq(giftCards.isActive, true)));
    return giftCard;
  }

  async updateGiftCardBalance(id: number, balance: number) {
    await db.update(giftCards).set({ balance }).where(eq(giftCards.id, id));
  }
}

export const storage = new DatabaseStorage();
