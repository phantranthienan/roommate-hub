import { Feedback, FeedbackVote } from '../../db/index.js';
import { NotFoundError, ConflictError, BadRequestError } from '../../errors/index.js';
import { getRoomMember } from '../../utils/permissions.js';

async function listFeedback(roomId, filters = {}, requestingUserId) {
  const where = { roomId };
  if (filters.type) where.type = filters.type;
  if (filters.status) where.status = filters.status;

  let requestingMemberId = null;
  if (requestingUserId) {
    const member = await getRoomMember(requestingUserId, roomId);
    requestingMemberId = member?.id ?? null;
  }

  const result = await Feedback.findAll({
    where,
    order: [['createdAt', 'DESC']],
  });

  return Promise.all(
    result.map(async (fb) => {
      const plain = fb.get({ plain: true });
      const votes = await getVoteCount(plain.id);

      let userVoted = false;
      if (requestingMemberId) {
        const vote = await FeedbackVote.findOne({
          where: { feedbackId: plain.id, roomMemberId: requestingMemberId },
        });
        userVoted = !!vote;
      }

      return {
        ...plain,
        votes,
        userVoted,
      };
    })
  );
}

async function createFeedback(roomId, creatorUserId, input) {
  const creatorMember = await getRoomMember(creatorUserId, roomId);

  const fb = await Feedback.create({
    roomId,
    createdBy: creatorMember.id,
    type: input.type,
    title: input.title,
    description: input.description,
  });

  const plain = fb.get({ plain: true });
  return {
    ...plain,
    votes: 0,
  };
}

async function voteFeedback(roomId, feedbackId, voterUserId) {
  const voterMember = await getRoomMember(voterUserId, roomId);

  const fb = await Feedback.findOne({
    where: { id: feedbackId, roomId },
  });
  if (!fb) {
    throw new NotFoundError('Feedback');
  }
  if (fb.status !== 'open') {
    throw new BadRequestError('Cannot vote on closed feedback');
  }

  const existingVote = await FeedbackVote.findOne({
    where: { feedbackId, roomMemberId: voterMember.id },
  });

  if (existingVote) {
    throw new ConflictError('You have already voted');
  }

  await FeedbackVote.create({
    feedbackId,
    roomMemberId: voterMember.id,
  });

  const votes = await getVoteCount(feedbackId);
  return { votes, userVoted: true };
}

async function removeVote(roomId, feedbackId, voterUserId) {
  const voterMember = await getRoomMember(voterUserId, roomId);

  const fb = await Feedback.findOne({
    where: { id: feedbackId, roomId },
  });
  if (!fb) {
    throw new NotFoundError('Feedback');
  }
  if (fb.status !== 'open') {
    throw new BadRequestError('Cannot change vote on closed feedback');
  }

  const vote = await FeedbackVote.findOne({
    where: { feedbackId, roomMemberId: voterMember.id },
  });

  if (!vote) {
    throw new NotFoundError('Vote');
  }

  await vote.destroy();

  const votes = await getVoteCount(feedbackId);
  return { votes, userVoted: false };
}

async function closeFeedback(roomId, feedbackId, status) {
  const [affectedCount, affectedRows] = await Feedback.update(
    { status, closedAt: new Date(), updatedAt: new Date() },
    { where: { id: feedbackId, roomId }, returning: true }
  );

  if (affectedCount === 0) {
    throw new NotFoundError('Feedback');
  }

  const votes = await getVoteCount(feedbackId);
  return { ...affectedRows[0].get({ plain: true }), votes };
}

async function getVoteCount(feedbackId) {
  return FeedbackVote.count({ where: { feedbackId } });
}

export {
  listFeedback,
  createFeedback,
  voteFeedback,
  removeVote,
  closeFeedback,
};
