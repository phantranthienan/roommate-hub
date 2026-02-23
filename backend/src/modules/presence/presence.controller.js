import { asyncHandler } from '../../middlewares/async-handler.js';
import { sendSuccess } from '../../utils/response.js';
import { UnauthorizedError } from '../../errors/index.js';
import { getRoomPresence, updatePresence } from './presence.service.js';

export const getPresenceHandler = asyncHandler(
  async (req, res) => {
    const presence = await getRoomPresence(req.params.roomId);
    sendSuccess(res, presence);
  }
);

export const updatePresenceHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const result = await updatePresence(
      req.params.roomId,
      req.user.userId,
      req.body.isPresent
    );
    sendSuccess(res, result);
  }
);
