import type { Express } from "express";
import { type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

import { seed } from "./seed";

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
    if (!req.isAuthenticated() || req.user.role !== "admin") return res.sendStatus(403);
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const product = await storage.createProduct(parsed.data);
    res.status(201).json(product);
  });

  app.put("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") return res.sendStatus(403);
    const id = parseInt(req.params.id);
    const product = await storage.updateProduct(id, req.body);
    res.json(product);
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") return res.sendStatus(403);
    const id = parseInt(req.params.id);
    await storage.deleteProduct(id);
    res.sendStatus(200);
  });

  // Orders
  app.post("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // items: { productId: number, quantity: number }[]
    const { items, deliveryAddress, totalAmount } = req.body;
    
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
      userId: req.user.id,
      totalAmount,
      deliveryAddress,
      paymentMethod: "UPI",
      status: "pending",
      paymentStatus: "pending_verification"
    }, orderItemsData);

    res.status(201).json(order);
  });

  app.get("/api/orders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    if (req.user.role === "admin") {
      const orders = await storage.getAllOrders();
      return res.json(orders);
    } else {
      const orders = await storage.getOrders(req.user.id);
      return res.json(orders);
    }
  });

  // Jobs
  app.get("/api/jobs", async (req, res) => {
    const jobs = await storage.getJobs();
    res.json(jobs);
  });

  app.post("/api/jobs", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") return res.sendStatus(403);
    const job = await storage.createJob(req.body);
    res.status(201).json(job);
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    if (!req.isAuthenticated() || req.user.role !== "admin") return res.sendStatus(403);
    const id = parseInt(req.params.id);
    await storage.deleteJob(id);
    res.sendStatus(200);
  });

  // Messages
  app.post("/api/messages", async (req, res) => {
    const message = await storage.createMessage(req.body);
    res.status(201).json(message);
  });

  return httpServer;
}
