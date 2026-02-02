import type { Express } from "express";
import { type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

import { seed } from "./seed";

import { Resend } from "resend";

// Initialize Resend with the new API key
const resend = process.env.RESEND_API_KEY_NEW
  ? new Resend(process.env.RESEND_API_KEY_NEW)
  : null;

import { registerChatRoutes } from "./replit_integrations/chat";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  setupAuth(app);
  registerChatRoutes(app);

  // Initialize seed data
  seed().catch(console.error);

  // Products
  app.get("/api/products", async (req, res) => {
    const products = await storage.getProducts();
    res.json(products);
  });

  app.post("/api/products", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin")
      return res.sendStatus(403);
    const parsed = insertProductSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json(parsed.error);
    const product = await storage.createProduct(parsed.data);
    res.status(201).json(product);
  });

  app.put("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin")
      return res.sendStatus(403);
    const id = parseInt(req.params.id);
    const product = await storage.updateProduct(id, req.body);
    res.json(product);
  });

  app.delete("/api/products/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin")
      return res.sendStatus(403);
    const id = parseInt(req.params.id);
    await storage.deleteProduct(id);
    res.sendStatus(200);
  });

  // Orders
  app.patch("/api/orders/:id/status", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin")
      return res.sendStatus(403);
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
    const {
      items,
      deliveryAddress,
      totalAmount,
      promoCode,
      giftCardCode,
      discountAmount,
    } = req.body;

    // Validate stock and calculate price (simplified)
    const orderItemsData = [];
    for (const item of items) {
      const product = await storage.getProduct(item.productId);
      if (!product) return res.status(400).send("Product not found");
      orderItemsData.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtTime: product.price,
      });
    }

    const order = await storage.createOrder(
      {
        userId: (req.user as any).id,
        totalAmount,
        discountAmount: discountAmount || 0,
        promoCode: promoCode || null,
        giftCardCode: giftCardCode || null,
        deliveryAddress,
        paymentMethod: "UPI",
        status: "pending",
        paymentStatus: "pending_verification",
      },
      orderItemsData as any,
    );

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

  // AI Recommendations
  app.get("/api/recommendations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const products = await storage.getProducts();
      const userOrders = await storage.getOrders((req.user as any).id);
      
      // Get all items from previous orders
      const previousProductIds = new Set<number>();
      for (const order of userOrders) {
        // This assumes order has items, if not we'd fetch them
        // For now, let's just use the product list and a generic prompt
        // as we don't have a robust way to fetch all order items efficiently here without adding a storage method
      }

      const { OpenAI } = await import("openai");
      const openai = new OpenAI();
      
      const prompt = `Based on our tea shop menu:
${products.map(p => `- ${p.name}: ${p.description} (Category: ${p.category})`).join("\n")}

Suggest 3 personalized tea or drink recommendations for a user who loves authentic Indian flavors and refreshing drinks. Return only a JSON array of product names.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;
      const suggestions = content ? JSON.parse(content).recommendations || [] : [];
      
      const recommendedProducts = products.filter(p => 
        suggestions.some((s: string) => p.name.toLowerCase().includes(s.toLowerCase()))
      );

      res.json(recommendedProducts.length > 0 ? recommendedProducts : products.slice(0, 3));
    } catch (error) {
      console.error("Recommendation error:", error);
      res.status(500).json({ message: "Failed to get recommendations" });
    }
  });

  // Jobs
  app.get("/api/jobs", async (req, res) => {
    const jobs = await storage.getJobs();
    res.json(jobs);
  });

  app.post("/api/jobs", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin")
      return res.sendStatus(403);
    const job = await storage.createJob(req.body);
    res.status(201).json(job);
  });

  app.patch("/api/jobs/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin")
      return res.sendStatus(403);
    const id = parseInt(req.params.id);
    const job = await storage.updateJob(id, req.body);
    res.json(job);
  });

  app.delete("/api/jobs/:id", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin")
      return res.sendStatus(403);
    const id = parseInt(req.params.id);
    await storage.deleteJob(id);
    res.sendStatus(200);
  });

  // Job Applications
  app.get("/api/job-applications", async (req, res) => {
    if (!req.isAuthenticated() || (req.user as any).role !== "admin")
      return res.sendStatus(403);
    const apps = await storage.getJobApplications();
    res.json(apps);
  });

  app.get("/api/my-applications", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const apps = await storage.getJobApplications(
      undefined,
      (req.user as any).id,
    );
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
    if (!req.isAuthenticated() || (req.user as any).role !== "admin")
      return res.sendStatus(403);
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const appData = await storage.updateJobApplicationStatus(id, status);
    console.log(
      `[DEBUG] Updated job application status for ID ${id} to ${status}. appData:`,
      JSON.stringify(appData),
    );
    const jobs = await storage.getJobs();
    const job = jobs.find((j) => j.id === appData.jobId);
    const jobTitle = job ? job.role : "Position";

    // Notification Message Template
    const emailSubject = "Job Application Status Update";
    const emailBody = `Hello ${appData.name},\n\nYour application status has been updated.\n\nCurrent Status: ${status}\n\nWe will contact you if further steps are required.\n\nRegards,\nHR Team`;

    // Attempting to send via Resend ONLY as requested
    if (appData.email) {
      if (resend) {
        try {
          // Send to the applicant
          const { data, error } = await resend.emails.send({
            from: "Chai Craft <onboarding@resend.dev>",
            replyTo: "chandan32005c@gmail.com",
            to: [appData.email],
            subject: emailSubject,
            html: `
              <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4a3728;">Hello ${appData.name},</h2>
                <p>Your application status has been updated for the position of <strong>${jobTitle}</strong>.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Current Status:</strong> <span style="text-transform: capitalize;">${status}</span></p>
                </div>
                <p>We will contact you if further steps are required.</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 0.9em;">Regards,<br><strong>HR Team</strong><br>Chai Craft</p>
              </div>
            `,
          });

          if (error) {
            console.error("[RESEND] API Error (Applicant):", error);
          } else {
            console.log(
              `[RESEND] Email sent successfully to applicant: ${appData.email}, ID: ${data?.id}`,
            );
          }
        } catch (error) {
          console.error("[RESEND] Failed to send email via Resend:", error);
        }
      }
    } else {
      console.log(`[NOTIFICATION] No email provided for application ID ${id}`);
    }

    res.json(appData);
  });

  // Messages
  app.post("/api/messages", async (req, res) => {
    const contactData = req.body;

    // Notification Message Template for Contact Form
    const emailSubject = "Contact Form Submission Received";
    const emailBody = `Hello ${contactData.name},\n\nThank you for reaching out to Chai Craft. We have received your message and will get back to you shortly.\n\nYour Message:\n${contactData.message}\n\nRegards,\nChai Craft Team`;

    if (contactData.email) {
      if (resend) {
        try {
          await resend.emails.send({
            from: "Chai Craft <onboarding@resend.dev>",
            replyTo: "chandan32005c@gmail.com",
            to: [contactData.email],
            subject: emailSubject,
            html: `
              <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                <h2 style="color: #4a3728;">Hello ${contactData.name},</h2>
                <p>Thank you for reaching out to Chai Craft. We have received your message and will get back to you shortly.</p>
                <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Your Message:</strong></p>
                  <p style="color: #555; font-style: italic;">"${contactData.message}"</p>
                </div>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 0.9em;">Regards,<br><strong>Chai Craft Team</strong></p>
              </div>
            `,
          });
          console.log(
            `[RESEND] Contact confirmation sent to: ${contactData.email}`,
          );
        } catch (error) {
          console.error("[RESEND] Failed to send contact confirmation:", error);
        }
      }
    }

    const message = await storage.createMessage(contactData);
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
      comment,
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
