import { Router } from 'express';
import {
  createRoomHandler,
  listRoomsHandler,
  getRoomHandler,
  updateRoomHandler,
  deleteRoomHandler,
  joinRoomHandler,
  leaveRoomHandler,
} from './rooms.controller.js';
import {
  createRoomSchema,
  updateRoomSchema,
  joinRoomSchema,
  roomIdParamSchema,
} from './rooms.schemas.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requirePermission, requireRoomMember } from '../../middlewares/rbac.middleware.js';
import membersRoutes from '../members/members.routes.js';
import tasksRoutes from '../tasks/tasks.routes.js';
import feedbackRoutes from '../feedback/feedback.routes.js';
import rulesRoutes from '../rules/rules.routes.js';
import itemsRoutes from '../items/items.routes.js';
import presenceRoutes from '../presence/presence.routes.js';
import { roomGuestsRoutes } from '../guests/guests.routes.js';

const router = Router();

router.use(requireAuth);

router.post('/', validateRequest({ body: createRoomSchema }), createRoomHandler);

router.get('/', listRoomsHandler);

router.post('/join', validateRequest({ body: joinRoomSchema }), joinRoomHandler);

router.get(
  '/:roomId',
  validateRequest({ params: roomIdParamSchema }),
  requireRoomMember(),
  getRoomHandler
);

router.patch(
  '/:roomId',
  validateRequest({ params: roomIdParamSchema, body: updateRoomSchema }),
  requirePermission('edit_room'),
  updateRoomHandler
);

router.delete(
  '/:roomId',
  validateRequest({ params: roomIdParamSchema }),
  requirePermission('delete_room'),
  deleteRoomHandler
);

router.post(
  '/:roomId/leave',
  validateRequest({ params: roomIdParamSchema }),
  requireRoomMember(),
  leaveRoomHandler
);

router.use('/:roomId/members', membersRoutes);
router.use('/:roomId/tasks', tasksRoutes);
router.use('/:roomId/feedback', feedbackRoutes);
router.use('/:roomId/rules', rulesRoutes);
router.use('/:roomId/items', itemsRoutes);
router.use('/:roomId/presence', presenceRoutes);
router.use('/:roomId/guests', roomGuestsRoutes);

export default router;
