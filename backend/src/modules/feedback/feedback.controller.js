import { asyncHandler } from '../../middlewares/async-handler.js';
import { sendSuccess } from '../../utils/response.js';
import {
  listFeedback,
  createFeedback,
  voteFeedback,
  removeVote,
  closeFeedback,
} from './feedback.service.js';

export const listFeedbackHandler = asyncHandler(
  async (req, res) => {
    const feedbackList = await listFeedback(req.params.roomId, req.query, req.user.userId);
    sendSuccess(res, feedbackList);
  }
);

export const createFeedbackHandler = asyncHandler(
  async (req, res) => {
    const fb = await createFeedback(req.params.roomId, req.user.userId, req.body);
    sendSuccess(res, fb, 201);
  }
);

export const voteHandler = asyncHandler(
  async (req, res) => {
    const result = await voteFeedback(
      req.params.roomId,
      req.params.feedbackId,
      req.user.userId
    );
    sendSuccess(res, result);
  }
);

export const removeVoteHandler = asyncHandler(
  async (req, res) => {
    const result = await removeVote(
      req.params.roomId,
      req.params.feedbackId,
      req.user.userId
    );
    sendSuccess(res, result);
  }
);

export const closeFeedbackHandler = asyncHandler(
  async (req, res) => {
    const fb = await closeFeedback(
      req.params.roomId,
      req.params.feedbackId,
      req.body.status
    );
    sendSuccess(res, fb);
  }
);
