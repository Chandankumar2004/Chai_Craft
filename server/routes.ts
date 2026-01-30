import type { Express } from "express";
import { type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

import { seed } from "./seed";

import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  setupAuth(app);
  
  // Initialize seed data
  seed().catch(console.error);

  // Products
  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const product = await storage.createProduct(parsed.data);
    res.status(201).json(product);
  });

  app.put("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const id = parseInt(req.params.id);
    const product = await storage.updateProduct(id, req.body);
    res.json(product);
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const id = parseInt(req.params.id);
    await storage.deleteProduct(id);
    res.sendStatus(200);
  });

  // Orders
  app.patch("/api/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const id = parseInt(req.params.id);
    const { status, paymentStatus } = req.body;
    try {
      const order = await storage.updateOrderStatus(id, status, paymentStatus);
      res.json(order);
    } catch (error: any) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // items: { productId: number, quantity: number }[]
    const { items, deliveryAddress, totalAmount, promoCode, giftCardCode, discountAmount } = req.body;
    
    // Validate stock and calculate price (simplified)
    const orderItemsData = [];
    for (const item of items) {
      const product = await storage.getProduct(item.productId);
      if (!product) return res.status(400).send("Product not found");
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtTime: product.price
      });
    }

    const order = await storage.createOrder({
      userId: (req.user as any).id,
      totalAmount,
      discountAmount: discountAmount || 0,
      promoCode: promoCode || null,
      giftCardCode: giftCardCode || null,
      deliveryAddress,
      paymentMethod: "UPI",
      status: "pending",
      paymentStatus: "pending_verification"
    }, orderItemsData as any);

    res.status(201).json(order);
  });

  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if ((req.user as any).role === "admin") {
      const orders = await storage.getAllOrders();
      return res.json(orders);
    } else {
      const orders = await storage.getOrders((req.user as any).id);
      return res.json(orders);
    }
  });

  // Jobs
  app.get("/api/jobs", async (req, res) => {
    const jobs = await storage.getJobs();
    res.json(jobs);
  });

  app.post("/api/jobs", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const job = await storage.createJob(req.body);
    res.status(201).json(job);
  });

  app.patch("/api/jobs/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const id = parseInt(req.params.id);
    const job = await storage.updateJob(id, req.body);
    res.json(job);
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const id = parseInt(req.params.id);
    await storage.deleteJob(id);
    res.sendStatus(200);
  });

  // Job Applications
  app.get("/api/job-applications", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const apps = await storage.getJobApplications();
    res.json(apps);
  });

  app.get("/api/my-applications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const apps = await storage.getJobApplications(undefined, (req.user as any).id);
    res.json(apps);
  });

  app.post("/api/job-applications", async (req, res) => {
    const userId = req.isAuthenticated() ? (req.user as any).id : null;
    const appData = await storage.createJobApplication({ ...req.body, userId });
    res.status(201).json(appData);
  });

  app.delete("/api/job-applications/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const id = parseInt(req.params.id);
    // Simple verification (could be more robust)
    await storage.deleteJobApplication(id);
    res.sendStatus(200);
  });

  app.patch("/api/job-applications/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin") return res.sendStatus(403);
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const appData = await storage.updateJobApplicationStatus(id, status);
    console.log(`[DEBUG] Updated job application status for ID ${id} to ${status}. appData:`, JSON.stringify(appData));
    const jobs = await storage.getJobs();
    const job = jobs.find(j => j.id === appData.jobId);
    const jobTitle = job ? job.role : "Position";
    
    // Simulate Notification
    const message = `Dear ${appData.name},\n\nWe are writing to inform you that your job application for the ${jobTitle} position at Chai Craft has been updated to: ${status.toUpperCase()}.\n\nThank you for your interest in joining our team.\n\nBest regards,\nChai Craft Team`;
    console.log(`[NOTIFICATION] ${message}`);

    if (resend && appData.email === 'chandan32005c@gmail.com') {
      try {
        const emailOptions = {
          from: 'Chai Craft <onboarding@resend.dev>',
          to: 'chandan32005c@gmail.com',
          subject: `Job Application Status Update: ${jobTitle} - Chai Craft`,
          text: message,
        };
        console.log(`[EMAIL] Attempting to send to chandan32005c@gmail.com:`, JSON.stringify(emailOptions));
        const result = await resend.emails.send(emailOptions);
        console.log(`[EMAIL] Result for chandan32005c@gmail.com:`, JSON.stringify(result));
      } catch (error) {
        console.error('Failed to send email:', error);
      }
    } else {
      console.log(`[EMAIL] Skipping email send. resend exists: ${!!resend}, email match: ${appData.email === 'chandan32005c@gmail.com'}, email was: ${appData.email}`);
    }
    
    res.json(appData);
  });

  // Messages
  app.post("/api/messages", async (req, res) => {
    const message = await storage.createMessage(req.body);
    res.status(201).json(message);
  });

  // Reviews
  app.get("/api/products/:id/reviews", async (req, res) => {
    const id = parseInt(req.params.id);
    const reviews = await storage.getReviewsByProduct(id);
    res.json(reviews);
  });

  app.post("/api/products/:id/reviews", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const productId = parseInt(req.params.id);
    const { rating, comment } = req.body;
    const review = await storage.createReview({
      productId,
      userId: (req.user as any).id,
      rating: parseInt(rating),
      comment
    });
    res.status(201).json(review);
  });

  // Promos
  app.get("/api/promos/:code", async (req, res) => {
    const promo = await storage.getPromoByCode(req.params.code);
    if (!promo) return res.status(404).send("Promo code not found");
    res.json(promo);
  });

  // Gift Cards
  app.get("/api/gift-cards/:code", async (req, res) => {
    const giftCard = await storage.getGiftCardByCode(req.params.code);
    if (!giftCard) return res.status(404).send("Gift card not found");
    res.json(giftCard);
  });

  return httpServer;
}
