import { z } from 'zod';

export const memberIdParamSchema = z.object({
  roomId: z.uuid(),
  memberId: z.uuid(),
});

export const changeRoleSchema = z.object({
  roleId: z.coerce.number().int().positive(),
});

export const transferOwnershipSchema = z.object({
  newOwnerId: z.uuid(),
});
