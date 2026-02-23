import { asyncHandler } from '../../middlewares/async-handler.js';
import { sendSuccess } from '../../utils/response.js';
import { UnauthorizedError } from '../../errors/index.js';
import {
  listInvitations,
  createInvitation,
  revokeInvitation,
  acceptInvitation,
} from './guests.service.js';

export const listInvitationsHandler = asyncHandler(
  async (req, res) => {
    const invitations = await listInvitations(req.params.roomId);
    sendSuccess(res, invitations);
  }
);

export const createInvitationHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const invitation = await createInvitation(
      req.params.roomId,
      req.user.userId,
      req.body
    );
    sendSuccess(res, invitation, 201);
  }
);

export const revokeInvitationHandler = asyncHandler(
  async (req, res) => {
    const result = await revokeInvitation(
      req.params.roomId,
      req.params.invitationId
    );
    sendSuccess(res, result);
  }
);

export const acceptInvitationHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const result = await acceptInvitation(req.user.userId, req.body.invitationCode);
    sendSuccess(res, result);
  }
);
