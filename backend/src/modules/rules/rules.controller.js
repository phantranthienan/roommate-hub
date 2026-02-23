import { asyncHandler } from '../../middlewares/async-handler.js';
import { sendSuccess } from '../../utils/response.js';
import { UnauthorizedError } from '../../errors/index.js';
import {
  listRules,
  getRule,
  createRule,
  updateRule,
  deleteRule,
  voteRule,
  removeRuleVote,
  acceptRule,
  getPendingAcceptance,
} from './rules.service.js';

export const listRulesHandler = asyncHandler(
  async (req, res) => {
    const rules = await listRules(req.params.roomId, req.query, req.user?.userId);
    sendSuccess(res, rules);
  }
);

export const getRuleHandler = asyncHandler(
  async (req, res) => {
    const rule = await getRule(req.params.roomId, req.params.ruleId);
    sendSuccess(res, rule);
  }
);

export const createRuleHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const rule = await createRule(req.params.roomId, req.user.userId, req.body);
    sendSuccess(res, rule, 201);
  }
);

export const updateRuleHandler = asyncHandler(
  async (req, res) => {
    const rule = await updateRule(req.params.roomId, req.params.ruleId, req.body);
    sendSuccess(res, rule);
  }
);

export const deleteRuleHandler = asyncHandler(
  async (req, res) => {
    const result = await deleteRule(req.params.roomId, req.params.ruleId);
    sendSuccess(res, result);
  }
);

export const voteRuleHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const result = await voteRule(
      req.params.roomId,
      req.params.ruleId,
      req.user.userId
    );
    sendSuccess(res, result);
  }
);

export const removeVoteHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const result = await removeRuleVote(
      req.params.roomId,
      req.params.ruleId,
      req.user.userId
    );
    sendSuccess(res, result);
  }
);

export const acceptRuleHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const result = await acceptRule(
      req.params.roomId,
      req.params.ruleId,
      req.user.userId
    );
    sendSuccess(res, result);
  }
);

export const getPendingAcceptanceHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const rules = await getPendingAcceptance(req.params.roomId, req.user.userId);
    sendSuccess(res, rules);
  }
);
