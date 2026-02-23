import { ZodError } from 'zod';
import { AppError } from '../errors/index.js';

export function errorHandler(err, req, res, next) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: 'UnprocessableEntity',
      message: 'Validation failed',
      details: err.flatten(),
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.error,
      message: err.message,
      details: err.details,
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    });
  }

  console.error(err);

  return res.status(500).json({
    error: 'InternalError',
    message: 'Internal Server Error',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
}
