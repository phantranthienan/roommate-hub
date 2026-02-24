import { Router } from 'express';
import {
  listRulesHandler,
  getRuleHandler,
  createRuleHandler,
  updateRuleHandler,
  deleteRuleHandler,
  voteRuleHandler,
  removeVoteHandler,
  approveRuleHandler,
  rejectRuleHandler,
} from './rules.controller.js';
import {
  ruleIdParamSchema,
  createRuleSchema,
  updateRuleSchema,
  listRulesQuerySchema,
} from './rules.schemas.js';
import { validateRequest } from '../../middlewares/validate.middleware.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';

const router = Router({ mergeParams: true });

router.use(requireAuth);

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

router.patch(
  '/:ruleId/approve',
  validateRequest({ params: ruleIdParamSchema }),
  requirePermission('modify_rules'),
  approveRuleHandler
);

router.patch(
  '/:ruleId/reject',
  validateRequest({ params: ruleIdParamSchema }),
  requirePermission('modify_rules'),
  rejectRuleHandler
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

export default router;
