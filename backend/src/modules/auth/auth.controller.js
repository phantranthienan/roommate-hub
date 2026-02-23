import { asyncHandler } from '../../middlewares/async-handler.js';
import { sendSuccess } from '../../utils/response.js';
import { UnauthorizedError } from '../../errors/index.js';
import {
  register,
  login,
  getCurrentUser,
  updateProfile,
} from './auth.service.js';

export const registerHandler = asyncHandler(
  async (req, res) => {
    const result = await register(req.body);
    sendSuccess(res, result, 201);
  }
);

export const loginHandler = asyncHandler(
  async (req, res) => {
    const result = await login(req.body);
    sendSuccess(res, result);
  }
);

export const meHandler = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new UnauthorizedError();
  }

  const result = await getCurrentUser(req.user.userId);
  sendSuccess(res, result);
});

export const updateProfileHandler = asyncHandler(
  async (req, res) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const result = await updateProfile(req.user.userId, req.body);
    sendSuccess(res, result);
  }
);
