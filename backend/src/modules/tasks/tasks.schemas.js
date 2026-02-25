import { z } from 'zod';

export const taskIdParamSchema = z.object({
  roomId: z.uuid(),
  taskId: z.uuid(),
});

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional(),
  assignedTo: z.uuid().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  dueDate: z.coerce.date().optional().nullable(),
  assignedTo: z.uuid().optional().nullable(),
});

export const listTasksQuerySchema = z.object({
  status: z.enum(['pending', 'done']).optional(),
});

export const renewTaskSchema = z.object({
  dueDate: z.coerce.date(),
  assignedTo: z.uuid().optional(),
});
