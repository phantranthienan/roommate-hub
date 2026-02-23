import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateRoomSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const joinRoomSchema = z.object({
  inviteCode: z.string().min(1),
});

export const roomIdParamSchema = z.object({
  roomId: z.uuid(),
});
