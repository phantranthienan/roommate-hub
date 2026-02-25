import { asyncHandler } from '../../middlewares/async-handler.js';
import { sendSuccess } from '../../utils/response.js';
import {
  getRoomMembers,
  removeMember,
  changeMemberRole,
  transferOwnership,
} from './members.service.js';

export const listMembersHandler = asyncHandler(
  async (req, res) => {
    const members = await getRoomMembers(req.params.roomId);
    sendSuccess(res, members);
  }
);

export const removeMemberHandler = asyncHandler(
  async (req, res) => {
    const result = await removeMember(
      req.user.userId,
      req.params.roomId,
      req.params.memberId
    );
    sendSuccess(res, result);
  }
);

export const changeRoleHandler = asyncHandler(
  async (req, res) => {
    const result = await changeMemberRole(
      req.user.userId,
      req.params.roomId,
      req.params.memberId,
      req.body.roleId
    );
    sendSuccess(res, result);
  }
);

export const transferOwnershipHandler = asyncHandler(
  async (req, res) => {
    const result = await transferOwnership(
      req.user.userId,
      req.params.roomId,
      req.body.newOwnerId
    );
    sendSuccess(res, result);
  }
);
