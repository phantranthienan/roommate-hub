import { Router } from 'express';
import {
  listRulesHandler,
  getRuleHandler,
  createRuleHandler,
  updateRuleHandler,
  deleteRuleHandler,
  voteRuleHandler,
  removeVoteHandler,
  acceptRuleHandler,
  getPendingAcceptanceHandler,
} from './rules.controller.js';
import {
  ruleIdParamSchema,
  createRuleSchema,
  updateRuleSchema,
  listRulesQuerySchema,
} from './rules.schemas.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requirePermission, requireRoomMember } from '../../middlewares/rbac.middleware.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

router.get(
  '/pending-acceptance',
  requireRoomMember(),
  getPendingAcceptanceHandler
);

router.get(
  '/',
  validateRequest({ query: listRulesQuerySchema }),
  requirePermission('view_rules'),
  listRulesHandler
);

router.post(
  '/',
  validateRequest({ body: createRuleSchema }),
  requirePermission('propose_rule'),
  createRuleHandler
);

router.get(
  '/:ruleId',
  validateRequest({ params: ruleIdParamSchema }),
  requirePermission('view_rules'),
  getRuleHandler
);

router.patch(
  '/:ruleId',
  validateRequest({ params: ruleIdParamSchema, body: updateRuleSchema }),
  requirePermission('modify_rules'),
  updateRuleHandler
);

router.delete(
  '/:ruleId',
  validateRequest({ params: ruleIdParamSchema }),
  requirePermission('modify_rules'),
  deleteRuleHandler
);

router.post(
  '/:ruleId/vote',
  validateRequest({ params: ruleIdParamSchema }),
  requirePermission('vote_rule'),
  voteRuleHandler
);

router.delete(
  '/:ruleId/vote',
  validateRequest({ params: ruleIdParamSchema }),
  requirePermission('vote_rule'),
  removeVoteHandler
);

router.post(
  '/:ruleId/accept',
  validateRequest({ params: ruleIdParamSchema }),
  requireRoomMember(),
  acceptRuleHandler
);

export default router;
