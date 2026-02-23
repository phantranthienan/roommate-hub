import { ForbiddenError } from '../errors/index.js';
import { hasPermission, isRoomMember } from '../utils/permissions.js';

export function requirePermission(permissionName) {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }
      const roomId = req.params.roomId;
      if (!roomId) {
        throw new ForbiddenError('Room context required');
      }
      const member = await isRoomMember(req.user.userId, roomId);
      if (!member) {
        throw new ForbiddenError('You are not a member of this room');
      }
      const allowed = await hasPermission(req.user.userId, roomId, permissionName);
      if (!allowed) {
        throw new ForbiddenError(`Permission "${permissionName}" required`);
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireRoomMember() {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }
      const roomId = req.params.roomId;
      if (!roomId) {
        throw new ForbiddenError('Room context required');
      }
      const allowed = await isRoomMember(req.user.userId, roomId);
      if (!allowed) {
        throw new ForbiddenError('You are not a member of this room');
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}
