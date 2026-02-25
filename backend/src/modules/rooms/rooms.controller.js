import { asyncHandler } from '../../middlewares/async-handler.js';
import { sendSuccess } from '../../utils/response.js';
import {
  createRoom,
  getUserRooms,
  updateRoom,
  deleteRoom,
  joinRoom,
  leaveRoom,
  rotateInviteCode,
} from './rooms.service.js';

export const createRoomHandler = asyncHandler(
  async (req, res) => {
    const room = await createRoom(req.user.userId, req.body);
    sendSuccess(res, room, 201);
  }
);

export const listRoomsHandler = asyncHandler(
  async (req, res) => {
    const rooms = await getUserRooms(req.user.userId);
    sendSuccess(res, rooms);
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
    const result = await joinRoom(req.user.userId, req.body.inviteCode);
    sendSuccess(res, result, 201);
  }
);

export const leaveRoomHandler = asyncHandler(
  async (req, res) => {
    const result = await leaveRoom(req.user.userId, req.params.roomId);
    sendSuccess(res, result);
  }
);

export const rotateInviteCodeHandler = asyncHandler(
  async (req, res) => {
    const room = await rotateInviteCode(req.params.roomId);
    sendSuccess(res, room);
  }
);
