export class AppError extends Error {
  constructor(statusCode, error, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.error = error;
    this.details = details;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Invalid request', details) {
    super(400, 'BadRequest', message, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(401, 'Unauthorized', message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(403, 'Forbidden', message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(404, 'NotFound', `${resource} not found`);
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(409, 'Conflict', message);
  }
}
