import { z } from 'zod';

export const itemIdParamSchema = z.object({
  roomId: z.uuid(),
  itemId: z.uuid(),
});

export const createItemSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().max(50).optional(),
});

export const updateItemSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z.string().max(50).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['available', 'low', 'out_of_stock']),
});

export const purchaseSchema = z.object({
  quantity: z.coerce.number().int().positive().optional().default(1),
  price: z.coerce.number().positive().optional(),
  currency: z.string().max(10).optional().default('EUR'),
  notes: z.string().max(255).optional(),
});

export const listItemsQuerySchema = z.object({
  status: z.enum(['available', 'low', 'out_of_stock']).optional(),
  category: z.string().optional(),
});

export const historyQuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional().default(10),
});
