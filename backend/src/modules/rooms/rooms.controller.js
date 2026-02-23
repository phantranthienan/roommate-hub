import { asyncHandler } from '../../middlewares/async-handler.js';
import { sendSuccess } from '../../utils/response.js';
import { UnauthorizedError } from '../../errors/index.js';
import {
  createRoom,
  getUserRooms,
  getRoom,
  updateRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
} from './rooms.service.js';

export const createRoomHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const room = await createRoom(req.user.userId, req.body);
    sendSuccess(res, room, 201);
  }
);

export const listRoomsHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const rooms = await getUserRooms(req.user.userId);
    sendSuccess(res, rooms);
  }
);

export const getRoomHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const room = await getRoom(req.params.roomId, req.user.userId);
    sendSuccess(res, room);
  }
);

export const updateRoomHandler = asyncHandler(
  async (req, res) => {
    const room = await updateRoom(req.params.roomId, req.body);
    sendSuccess(res, room);
  }
);

export const deleteRoomHandler = asyncHandler(
  async (req, res) => {
    await deleteRoom(req.params.roomId);
    sendSuccess(res, { success: true });
  }
);

export const joinRoomHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const result = await joinRoom(req.user.userId, req.body.inviteCode);
    sendSuccess(res, result, 201);
  }
);

export const leaveRoomHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const result = await leaveRoom(req.user.userId, req.params.roomId);
    sendSuccess(res, result);
  }
);
