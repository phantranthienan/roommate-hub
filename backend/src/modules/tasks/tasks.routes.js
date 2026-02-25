import { Router } from 'express';
import {
  listTasksHandler,
  createTaskHandler,
  updateTaskHandler,
  deleteTaskHandler,
  markDoneHandler,
  renewTaskHandler,
} from './tasks.controller.js';
import {
  taskIdParamSchema,
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
  renewTaskSchema,
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

router.patch(
  '/:taskId',
  validateRequest({ params: taskIdParamSchema, body: updateTaskSchema }),
  requirePermission('update_task'),
  updateTaskHandler
);

router.patch(
  '/:taskId/done',
  validateRequest({ params: taskIdParamSchema }),
  requirePermission('complete_task'),
  markDoneHandler
);

router.patch(
  '/:taskId/renew',
  validateRequest({ params: taskIdParamSchema, body: renewTaskSchema }),
  requirePermission('update_task'),
  renewTaskHandler
);

router.delete(
  '/:taskId',
  validateRequest({ params: taskIdParamSchema }),
  requirePermission('delete_task'),
  deleteTaskHandler
);

export default router;
