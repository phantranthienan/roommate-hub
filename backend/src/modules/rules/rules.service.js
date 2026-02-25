import { Op } from 'sequelize';
import { HouseRule, RuleVote, RoomMember, Role } from '../../db/index.js';
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

  const memberCount = await getActiveMemberCount(roomId);

  const rules = await HouseRule.findAll({
    where,
    order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']],
  });

  return Promise.all(
    rules.map(async (rule) => {
      const plain = rule.get({ plain: true });
      const votes = await getVoteCount(rule.id);

      let userVoted = false;

      if (requestingMemberId) {
        const vote = await RuleVote.findOne({
          where: { ruleId: rule.id, roomMemberId: requestingMemberId },
        });
        userVoted = !!vote;
      }

      return {
        ...plain,
        votes,
        memberCount,
        userVoted,
      };
    })
  );
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

  if (rule.status !== 'proposed') {
    throw new ConflictError('Can only vote on proposed rules');
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

  const rule = await HouseRule.findOne({
    where: { id: ruleId, roomId },
    attributes: ['id', 'status'],
  });
  if (!rule) {
    throw new NotFoundError('Rule');
  }
  if (rule.status !== 'proposed') {
    throw new ConflictError('Can only remove votes from proposed rules');
  }

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

async function approveRule(roomId, ruleId) {
  const rule = await HouseRule.findOne({
    where: { id: ruleId, roomId },
  });

  if (!rule) {
    throw new NotFoundError('Rule');
  }

  if (rule.status !== 'proposed') {
    throw new ConflictError('Only proposed rules can be approved');
  }

  const votes = await getVoteCount(ruleId);
  const memberCount = await getActiveMemberCount(roomId);
  const majorityNeeded = Math.ceil(memberCount / 2);

  if (votes < majorityNeeded) {
    throw new ForbiddenError(`Rule needs at least ${majorityNeeded} votes before it can be approved (currently ${votes})`);
  }

  await rule.update({ status: 'approved', approvedAt: new Date() });

  return { ...rule.get({ plain: true }), votes };
}

async function rejectRule(roomId, ruleId) {
  const rule = await HouseRule.findOne({
    where: { id: ruleId, roomId },
  });

  if (!rule) {
    throw new NotFoundError('Rule');
  }

  if (rule.status !== 'proposed') {
    throw new ConflictError('Only proposed rules can be rejected');
  }

  // Must be at least 24h since creation
  const hoursSinceCreation = (Date.now() - new Date(rule.createdAt).getTime()) / (1000 * 60 * 60);
  if (hoursSinceCreation < 24) {
    throw new ForbiddenError('Cannot reject a rule within 24 hours of creation');
  }

  // Cannot reject if votes already meet the majority threshold
  const votes = await getVoteCount(ruleId);
  const memberCount = await getActiveMemberCount(roomId);
  const majorityNeeded = Math.ceil(memberCount / 2);

  if (votes >= majorityNeeded) {
    throw new ForbiddenError('Cannot reject a rule that has enough votes for approval');
  }

  await rule.update({ status: 'rejected' });

  return { ...rule.get({ plain: true }), votes };
}

async function getVoteCount(ruleId) {
  return RuleVote.count({ where: { ruleId } });
}

async function getActiveMemberCount(roomId) {
  const guestRole = await Role.findOne({ where: { name: 'guest' }, attributes: ['id'] });
  const where = {
    roomId,
    isActive: true,
    [Op.or]: [{ expiresAt: null }, { expiresAt: { [Op.gt]: new Date() } }],
  };
  if (guestRole) where.roleId = { [Op.ne]: guestRole.id };
  return RoomMember.count({ where });
}

export {
  listRules,
  createRule,
  deleteRule,
  voteRule,
  removeRuleVote,
  approveRule,
  rejectRule,
};
