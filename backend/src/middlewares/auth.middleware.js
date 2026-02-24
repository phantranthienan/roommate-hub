import { UnauthorizedError } from '../errors/index.js';
import { verifyAccessToken } from '../utils/jwt.js';
import { User } from '../db/index.js';

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or invalid Authorization header');
    }

    const token = authHeader.slice(7);
    const decoded = verifyAccessToken(token);

    const user = await User.findByPk(decoded.userId, {
      attributes: ['id'],
    });

    if (!user) {
      throw new UnauthorizedError('Invalid token: user not found');
    }

    req.user = { userId: user.id };
    next();
  } catch (err) {
    next(err);
  }
}
