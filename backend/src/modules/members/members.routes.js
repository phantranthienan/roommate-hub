import { Router } from 'express';
import {
  listMembersHandler,
  removeMemberHandler,
  changeRoleHandler,
  transferOwnershipHandler,
} from './members.controller.js';
import {
  memberIdParamSchema,
  changeRoleSchema,
  transferOwnershipSchema,
} from './members.schemas.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requirePermission, requireRoomMember } from '../../middlewares/rbac.middleware.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get(
  '/',
  requireRoomMember(),
  listMembersHandler
);

router.delete(
  '/:memberId',
  validateRequest({ params: memberIdParamSchema }),
  requirePermission('remove_members'),
  removeMemberHandler
);

router.patch(
  '/:memberId/role',
  validateRequest({ params: memberIdParamSchema, body: changeRoleSchema }),
  requirePermission('change_roles'),
  changeRoleHandler
);

router.post(
  '/transfer-ownership',
  validateRequest({ body: transferOwnershipSchema }),
  requirePermission('transfer_ownership'),
  transferOwnershipHandler
);

export default router;
