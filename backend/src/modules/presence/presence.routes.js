import { Router } from 'express';
import { getPresenceHandler, updatePresenceHandler } from './presence.controller.js';
import { updatePresenceSchema } from './presence.schemas.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requirePermission, requireRoomMember } from '../../middlewares/rbac.middleware.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get('/', requireRoomMember(), getPresenceHandler);

router.patch(
  '/',
  validateRequest({ body: updatePresenceSchema }),
  requirePermission('update_own_presence'),
  updatePresenceHandler
);

export default router;
