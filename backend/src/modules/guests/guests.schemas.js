import { z } from 'zod';

export const invitationIdParamSchema = z.object({
  roomId: z.uuid(),
  invitationId: z.uuid(),
});

export const createInvitationSchema = z.object({
  label: z.string().min(1).max(50).optional(),
  validUntil: z.coerce.date(),
});

export const acceptInvitationSchema = z.object({
  invitationCode: z.string().min(1),
});
