import { z } from 'zod';

export const taskIdParamSchema = z.object({
  roomId: z.uuid(),
  taskId: z.uuid(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  dueTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  assignedTo: z.uuid().optional(),
  isRecurring: z.boolean().optional().default(false),
  recurrencePattern: z.enum(['daily', 'weekly', 'biweekly', 'monthly']).optional(),
  recurrenceEndDate: z.coerce.date().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional().nullable(),
  dueTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).optional().nullable(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  assignedTo: z.uuid().optional().nullable(),
  isRecurring: z.boolean().optional(),
  recurrencePattern: z.enum(['daily', 'weekly', 'biweekly', 'monthly']).optional().nullable(),
  recurrenceEndDate: z.coerce.date().optional().nullable(),
});

export const assignTaskSchema = z.object({
  assignedTo: z.uuid(),
});

export const listTasksQuerySchema = z.object({
  status: z.enum(['pending', 'completed']).optional(),
  assignedTo: z.uuid().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  dueBefore: z.coerce.date().optional(),
  dueAfter: z.coerce.date().optional(),
});
