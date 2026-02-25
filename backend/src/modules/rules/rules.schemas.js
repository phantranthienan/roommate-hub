import { z } from 'zod';

export const ruleIdParamSchema = z.object({
  roomId: z.uuid(),
  ruleId: z.uuid(),
});

export const createRuleSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().min(1),
  category: z.string().max(50).optional(),
  votingDeadline: z.coerce.date().optional(),
});

export const listRulesQuerySchema = z.object({
  status: z.enum(['proposed', 'approved', 'rejected', 'archived']).optional(),
});
