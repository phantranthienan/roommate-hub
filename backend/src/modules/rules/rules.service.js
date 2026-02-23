import { Op } from 'sequelize';
import { HouseRule, RuleVote, RuleAcceptance } from '../../db/index.js';
import { NotFoundError, ForbiddenError, ConflictError } from '../../errors/index.js';
import { getRoomMember } from '../../utils/permissions.js';

async function listRules(roomId, filters = {}, requestingUserId) {
  const where = { roomId };
  if (filters.status) where.status = filters.status;

  let requestingMemberId = null;
  if (requestingUserId) {
    const member = await getRoomMember(requestingUserId, roomId);
    requestingMemberId = member?.id ?? null;
  }

  const rules = await HouseRule.findAll({
    where,
    order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']],
  });

  return Promise.all(
    rules.map(async (rule) => {
      const plain = rule.get({ plain: true });
      const votes = await getVoteCount(rule.id);

      let userVoted = false;
      let userAccepted = false;

      if (requestingMemberId) {
        const vote = await RuleVote.findOne({
          where: { ruleId: rule.id, roomMemberId: requestingMemberId },
        });
        userVoted = !!vote;

        const acceptance = await RuleAcceptance.findOne({
          where: { ruleId: rule.id, roomMemberId: requestingMemberId },
        });
        userAccepted = !!acceptance;
      }

      return {
        ...plain,
        votes,
        userVoted,
        userAccepted,
      };
    })
  );
}

async function getRule(roomId, ruleId) {
  const rule = await HouseRule.findOne({
    where: { id: ruleId, roomId },
  });

  if (!rule) {
    throw new NotFoundError('Rule');
  }

  const votes = await getVoteCount(ruleId);
  return { ...rule.get({ plain: true }), votes };
}

async function createRule(roomId, proposerUserId, input) {
  const proposerMember = await getRoomMember(proposerUserId, roomId);

  const rule = await HouseRule.create({
    roomId,
    proposedBy: proposerMember.id,
    title: input.title,
    description: input.description,
    category: input.category,
    votingDeadline: input.votingDeadline ? new Date(input.votingDeadline) : undefined,
  });

  return { ...rule.get({ plain: true }), votes: 0 };
}

async function updateRule(roomId, ruleId, input) {
  const [affectedCount, affectedRows] = await HouseRule.update(
    { ...input, updatedAt: new Date() },
    { where: { id: ruleId, roomId }, returning: true }
  );

  if (affectedCount === 0) {
    throw new NotFoundError('Rule');
  }

  const votes = await getVoteCount(ruleId);
  return { ...affectedRows[0].get({ plain: true }), votes };
}

async function deleteRule(roomId, ruleId) {
  const rule = await HouseRule.findOne({ where: { id: ruleId, roomId } });

  if (!rule) {
    throw new NotFoundError('Rule');
  }

  await rule.destroy();
  return { success: true };
}

async function voteRule(roomId, ruleId, voterUserId) {
  const voterMember = await getRoomMember(voterUserId, roomId);

  const rule = await HouseRule.findOne({
    where: { id: ruleId, roomId },
    attributes: ['id', 'status'],
  });
  if (!rule) {
    throw new NotFoundError('Rule');
  }

  const existingVote = await RuleVote.findOne({
    where: { ruleId, roomMemberId: voterMember.id },
  });

  if (existingVote) {
    throw new ConflictError('You have already voted');
  }

  await RuleVote.create({
    ruleId,
    roomMemberId: voterMember.id,
  });

  const votes = await getVoteCount(ruleId);
  return { votes, userVoted: true };
}

async function removeRuleVote(roomId, ruleId, voterUserId) {
  const voterMember = await getRoomMember(voterUserId, roomId);

  const vote = await RuleVote.findOne({
    where: { ruleId, roomMemberId: voterMember.id },
  });

  if (!vote) {
    throw new NotFoundError('Vote');
  }

  await vote.destroy();

  const votes = await getVoteCount(ruleId);
  return { votes, userVoted: false };
}

async function acceptRule(roomId, ruleId, accepterUserId) {
  const accepterMember = await getRoomMember(accepterUserId, roomId);

  const rule = await HouseRule.findOne({
    where: { id: ruleId, roomId },
    attributes: ['id', 'status'],
  });
  if (!rule) {
    throw new NotFoundError('Rule');
  }

  if (rule.status !== 'approved') {
    throw new ForbiddenError('Can only accept approved rules');
  }

  const existing = await RuleAcceptance.findOne({
    where: { ruleId, roomMemberId: accepterMember.id },
  });

  if (existing) {
    throw new ConflictError('You have already accepted this rule');
  }

  await RuleAcceptance.create({
    ruleId,
    roomMemberId: accepterMember.id,
  });

  return { success: true };
}

async function getPendingAcceptance(roomId, userId) {
  const member = await getRoomMember(userId, roomId);

  const acceptedRules = await RuleAcceptance.findAll({
    where: { roomMemberId: member.id },
    attributes: ['ruleId'],
  });
  const acceptedRuleIds = acceptedRules.map((a) => a.ruleId);

  const where = {
    roomId,
    status: 'approved',
  };
  if (acceptedRuleIds.length > 0) {
    where.id = { [Op.notIn]: acceptedRuleIds };
  }

  const pendingRules = await HouseRule.findAll({
    where,
    order: [['displayOrder', 'ASC']],
  });

  return pendingRules.map((r) => r.get({ plain: true }));
}

async function getVoteCount(ruleId) {
  return RuleVote.count({ where: { ruleId } });
}

export {
  listRules,
  getRule,
  createRule,
  updateRule,
  deleteRule,
  voteRule,
  removeRuleVote,
  acceptRule,
  getPendingAcceptance,
};
