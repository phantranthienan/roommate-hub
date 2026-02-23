import { Router } from 'express';
import {
  listInvitationsHandler,
  createInvitationHandler,
  revokeInvitationHandler,
  acceptInvitationHandler,
} from './guests.controller.js';
import {
  invitationIdParamSchema,
  createInvitationSchema,
  acceptInvitationSchema,
} from './guests.schemas.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';

const roomRouter = Router({ mergeParams: true });

roomRouter.use(requireAuth);

roomRouter.get('/', requirePermission('invite_guests'), listInvitationsHandler);

roomRouter.post(
  '/',
  validateRequest({ body: createInvitationSchema }),
  requirePermission('invite_guests'),
  createInvitationHandler
);

roomRouter.delete(
  '/:invitationId',
  validateRequest({ params: invitationIdParamSchema }),
  requirePermission('invite_guests'),
  revokeInvitationHandler
);

const globalRouter = Router();

globalRouter.use(requireAuth);

globalRouter.post(
  '/accept',
  validateRequest({ body: acceptInvitationSchema }),
  acceptInvitationHandler
);

export default roomRouter;
export { roomRouter as roomGuestsRoutes };
export { globalRouter as guestsRoutes };
