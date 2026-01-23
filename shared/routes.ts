import { z } from 'zod';
import { insertUserSchema, insertProductSchema, insertOrderSchema } from './schema';

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.object({ id: z.number(), username: z.string(), role: z.string() }),
        400: z.object({ message: z.string() }),
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.object({ id: z.number(), username: z.string(), role: z.string() }),
        401: z.object({ message: z.string() }),
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.object({ id: z.number(), username: z.string(), role: z.string(), name: z.string() }).nullable(),
      },
    },
  },
  products: {
    list: {
      method: 'GET' as const,
      path: '/api/products',
      responses: {
        200: z.array(z.object({
          id: z.number(),
          name: z.string(),
          price: z.number(),
          category: z.string(),
          imageUrl: z.string(),
          stock: z.number(),
          isBestSeller: z.boolean().nullable(),
        })),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/products',
      input: insertProductSchema,
      responses: {
        201: z.object({ id: z.number() }),
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/products/:id',
      input: insertProductSchema.partial(),
      responses: {
        200: z.object({ id: z.number() }),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/products/:id',
      responses: {
        200: z.void(),
      },
    },
  },
  orders: {
    create: {
      method: 'POST' as const,
      path: '/api/orders',
      input: z.object({
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number(),
        })),
        deliveryAddress: z.string(),
        totalAmount: z.number(),
      }),
      responses: {
        201: z.object({ id: z.number() }),
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/orders',
      responses: {
        200: z.array(z.object({
          id: z.number(),
          totalAmount: z.number(),
          status: z.string(),
          paymentStatus: z.string(),
          createdAt: z.string(),
        })),
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/orders/:id/status',
      input: z.object({
        status: z.string().optional(),
        paymentStatus: z.string().optional(),
      }),
      responses: {
        200: z.object({ id: z.number() }),
      },
    },
  },
};
