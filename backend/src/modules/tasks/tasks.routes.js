import { Router } from 'express';
import {
  listTasksHandler,
  getTaskHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  assignTaskHandler,
  startTaskHandler,
  completeTaskHandler,
  cancelTaskHandler,
  updateTaskStatusHandler,
} from './tasks.controller.js';
import {
  taskIdParamSchema,
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  listTasksQuerySchema,
  updateTaskStatusSchema,
} from './tasks.schemas.js';
import { roomIdParamSchema } from '../rooms/rooms.schemas.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requirePermission, requireRoomMember } from '../../middlewares/rbac.middleware.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get(
  '/',
  validateRequest({ query: listTasksQuerySchema }),
  requireRoomMember(),
  listTasksHandler
);

router.post(
  '/',
  validateRequest({ body: createTaskSchema }),
  requirePermission('create_task'),
  createTaskHandler
);

router.get(
  '/:taskId',
  validateRequest({ params: taskIdParamSchema }),
  requireRoomMember(),
  getTaskHandler
);

router.patch(
  '/:taskId',
  validateRequest({ params: taskIdParamSchema, body: updateTaskSchema }),
  requirePermission('update_task'),
  updateTaskHandler
);

router.patch(
  '/:taskId/status',
  validateRequest({ params: taskIdParamSchema, body: updateTaskStatusSchema }),
  requirePermission('complete_task'),
  updateTaskStatusHandler
);

router.delete(
  '/:taskId',
  validateRequest({ params: taskIdParamSchema }),
  requirePermission('delete_task'),
  deleteTaskHandler
);

router.post(
  '/:taskId/assign',
  validateRequest({ params: taskIdParamSchema, body: assignTaskSchema }),
  requirePermission('assign_task'),
  assignTaskHandler
);

router.post(
  '/:taskId/start',
  validateRequest({ params: taskIdParamSchema }),
  requirePermission('complete_task'),
  startTaskHandler
);

router.post(
  '/:taskId/complete',
  validateRequest({ params: taskIdParamSchema }),
  requirePermission('complete_task'),
  completeTaskHandler
);

router.post(
  '/:taskId/cancel',
  validateRequest({ params: taskIdParamSchema }),
  requirePermission('delete_task'),
  cancelTaskHandler
);

export default router;
