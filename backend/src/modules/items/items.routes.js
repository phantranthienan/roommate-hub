import { Router } from 'express';
import {
  listItemsHandler,
  createItemHandler,
  updateItemHandler,
  deleteItemHandler,
  updateStatusHandler,
} from './items.controller.js';
import {
  itemIdParamSchema,
  createItemSchema,
  updateItemSchema,
  updateStatusSchema,
  listItemsQuerySchema,
} from './items.schemas.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requirePermission, requireRoomMember } from '../../middlewares/rbac.middleware.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get(
  '/',
  validateRequest({ query: listItemsQuerySchema }),
  requirePermission('view_items'),
  listItemsHandler
);

router.post(
  '/',
  validateRequest({ body: createItemSchema }),
  requirePermission('add_item'),
  createItemHandler
);

router.patch(
  '/:itemId',
  validateRequest({ params: itemIdParamSchema, body: updateItemSchema }),
  requirePermission('update_item'),
  updateItemHandler
);

router.delete(
  '/:itemId',
  validateRequest({ params: itemIdParamSchema }),
  requirePermission('delete_items'),
  deleteItemHandler
);

router.patch(
  '/:itemId/status',
  validateRequest({ params: itemIdParamSchema, body: updateStatusSchema }),
  requireRoomMember(),
  updateStatusHandler
);

export default router;
