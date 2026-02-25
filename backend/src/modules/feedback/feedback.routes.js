import { Router } from 'express';
import {
  listFeedbackHandler,
  createFeedbackHandler,
  voteHandler,
  removeVoteHandler,
  closeFeedbackHandler,
} from './feedback.controller.js';
import {
  feedbackIdParamSchema,
  createFeedbackSchema,
  closeFeedbackSchema,
  listFeedbackQuerySchema,
} from './feedback.schemas.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requirePermission, requireRoomMember } from '../../middlewares/rbac.middleware.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get(
  '/',
  validateRequest({ query: listFeedbackQuerySchema }),
  requireRoomMember(),
  listFeedbackHandler
);

router.post(
  '/',
  validateRequest({ body: createFeedbackSchema }),
  requirePermission('create_feedback'),
  createFeedbackHandler
);

router.post(
  '/:feedbackId/vote',
  validateRequest({ params: feedbackIdParamSchema }),
  requirePermission('vote_feedback'),
  voteHandler
);

router.delete(
  '/:feedbackId/vote',
  validateRequest({ params: feedbackIdParamSchema }),
  requirePermission('vote_feedback'),
  removeVoteHandler
);

router.patch(
  '/:feedbackId/close',
  validateRequest({ params: feedbackIdParamSchema, body: closeFeedbackSchema }),
  requirePermission('close_feedback'),
  closeFeedbackHandler
);

export default router;
