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

export const listItemsQuerySchema = z.object({
  status: z.enum(['available', 'low', 'out_of_stock']).optional(),
  category: z.string().optional(),
});
