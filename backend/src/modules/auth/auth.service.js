import bcrypt from 'bcryptjs';
import { User } from '../../db/index.js';
import { env } from '../../config/env.js';
import {
  ConflictError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
} from '../../errors/index.js';
import { signAccessToken } from '../../utils/jwt.js';

function toPublicUser(user) {
  const { passwordHash, ...publicUser } = user.get({ plain: true });
  return publicUser;
}

async function register(input) {
  const existing = await User.findOne({ where: { username: input.username } });

  if (existing) {
    throw new ConflictError('Username already in use');
  }

  const passwordHash = await bcrypt.hash(input.password, env.BCRYPT_ROUNDS);
  const user = await User.create({
    username: input.username,
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
  });

  const accessToken = signAccessToken({
    userId: user.id,
    username: user.username,
  });

  return {
    user: toPublicUser(user),
    accessToken,
  };
}

async function login(input) {
  const user = await User.findOne({ where: { username: input.username } });

  if (!user) {
    throw new UnauthorizedError('Invalid username or password');
  }

  const matches = await bcrypt.compare(input.password, user.passwordHash);
  if (!matches) {
    throw new UnauthorizedError('Invalid username or password');
  }

  const accessToken = signAccessToken({
    userId: user.id,
    username: user.username,
  });

  return {
    user: toPublicUser(user),
    accessToken,
  };
}

async function updateProfile(userId, input) {
  if (!input.firstName && !input.lastName && !input.avatarUrl) {
    throw new BadRequestError('No profile fields provided');
  }

  const [affectedCount, affectedRows] = await User.update(
    { ...input, updatedAt: new Date() },
    { where: { id: userId }, returning: true }
  );

  if (affectedCount === 0) {
    throw new NotFoundError('User');
  }

  return toPublicUser(affectedRows[0]);
}

export {
  register,
  login,
  updateProfile,
};
