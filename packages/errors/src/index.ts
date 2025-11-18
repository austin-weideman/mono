export interface ErrorOptions {
  cause?: Error;
  details?: Record<string, unknown>;
}

/**
 * Base application error class with observability support
 */
export class AppError extends Error {
  readonly statusCode: number;
  readonly details?: Record<string, unknown>;
  readonly timestamp: Date;

  constructor(message: string, statusCode: number, options?: ErrorOptions) {
    super(message, { cause: options?.cause });
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = options?.details;
    this.timestamp = new Date();

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
      cause: this.cause instanceof Error ? this.cause.message : this.cause,
    };
  }
}

/**
 * 400 Bad Request
 */
export class BadRequestError extends AppError {
  constructor(message = "Bad request", options?: ErrorOptions) {
    super(message, 400, options);
  }
}

/**
 * 401 Unauthorized - Authentication required
 */
export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required", options?: ErrorOptions) {
    super(message, 401, options);
  }
}

/**
 * 403 Forbidden - Authenticated but lacks permission
 */
export class ForbiddenError extends AppError {
  constructor(message = "Access denied", options?: ErrorOptions) {
    super(message, 403, options);
  }
}

/**
 * 404 Not Found
 */
export class NotFoundError extends AppError {
  constructor(message = "Resource not found", options?: ErrorOptions) {
    super(message, 404, options);
  }
}

/**
 * 409 Conflict
 */
export class ConflictError extends AppError {
  constructor(message = "Conflict", options?: ErrorOptions) {
    super(message, 409, options);
  }
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message = "Internal server error", options?: ErrorOptions) {
    super(message, 500, options);
  }
}
