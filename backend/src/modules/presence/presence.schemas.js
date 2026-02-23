import { z } from 'zod';

export const updatePresenceSchema = z.object({
  isPresent: z.boolean(),
});
