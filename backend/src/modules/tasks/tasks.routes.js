import { Router } from 'express';
import {
  listTasksHandler,
  getTaskHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  assignTaskHandler,
  completeTaskHandler,
} from './tasks.controller.js';
import {
  taskIdParamSchema,
  createTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  listTasksQuerySchema,
} from './tasks.schemas.js';
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
  '/:taskId/complete',
  validateRequest({ params: taskIdParamSchema }),
  requirePermission('complete_task'),
  completeTaskHandler
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

export default router;
