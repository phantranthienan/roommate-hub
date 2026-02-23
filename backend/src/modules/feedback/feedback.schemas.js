import { z } from 'zod';

export const feedbackIdParamSchema = z.object({
  roomId: z.uuid(),
  feedbackId: z.uuid(),
});

export const createFeedbackSchema = z.object({
  type: z.enum(['issue', 'suggestion']),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  isAnonymous: z.boolean().optional().default(false),
});

export const closeFeedbackSchema = z.object({
  status: z.enum(['done', 'rejected', 'archived']),
});

export const listFeedbackQuerySchema = z.object({
  type: z.enum(['issue', 'suggestion']).optional(),
  status: z.enum(['open', 'done', 'rejected', 'archived']).optional(),
});
