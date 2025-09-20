import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import mongoose from 'mongoose';
import logger from './logger';

// Standard error response format
export interface ErrorResponse {
  error: string;
  message?: string;
  details?: any;
  code?: string;
  timestamp: string;
  path?: string;
}

// Custom application errors
export class AppError extends Error {
  public statusCode: number;
  public code?: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Predefined error types
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND_ERROR');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR');
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, 429, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string) {
    super(message, 500, 'DATABASE_ERROR');
    this.name = 'DatabaseError';
  }
}

// Error handler utility function
export function createErrorResponse(
  error: Error | AppError | ZodError,
  path?: string
): NextResponse {
  const timestamp = new Date().toISOString();
  let statusCode = 500;
  let errorMessage = 'Internal server error';
  let details: any = undefined;
  let code: string | undefined = undefined;

  // Handle different error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    errorMessage = error.message;
    code = error.code;
  } else if (error instanceof ZodError) {
    statusCode = 400;
    errorMessage = 'Validation error';
    code = 'VALIDATION_ERROR';
    details = error.issues.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code,
    }));
  } else if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    errorMessage = 'Database validation error';
    code = 'DATABASE_VALIDATION_ERROR';
    details = Object.values(error.errors).map(err => ({
      field: err.path,
      message: err.message,
    }));
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    errorMessage = 'Invalid ID format';
    code = 'INVALID_ID_ERROR';
  } else if (error.message.includes('duplicate key')) {
    statusCode = 409;
    errorMessage = 'Resource already exists';
    code = 'DUPLICATE_ERROR';
  } else if (error.message.includes('Cast to ObjectId failed')) {
    statusCode = 400;
    errorMessage = 'Invalid ID format';
    code = 'INVALID_ID_ERROR';
  }

  // Log the error
  const context = path ? `API:${path}` : 'API';
  logger.error(errorMessage, context, error);

  // Create error response
  const errorResponse: ErrorResponse = {
    error: errorMessage,
    timestamp,
    ...(code && { code }),
    ...(details && { details }),
    ...(path && { path }),
  };

  // Don't expose internal error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorResponse.error = 'Internal server error';
    // Remove stack trace and sensitive information
  }

  return NextResponse.json(errorResponse, { status: statusCode });
}

// API route error wrapper
export function withErrorHandler(
  handler: (request: Request, ...args: any[]) => Promise<NextResponse>
) {
  return async (request: Request, ...args: any[]): Promise<NextResponse> => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      const url = new URL(request.url);
      return createErrorResponse(error as Error, url.pathname);
    }
  };
}

// Database operation wrapper with error handling
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  operationName: string
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    logger.performance(operationName, duration);
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.dbQuery(operationName, 'unknown', duration, error as Error);

    if (error instanceof mongoose.Error) {
      throw new DatabaseError(`Database operation failed: ${error.message}`);
    }

    throw error;
  }
}

// Validation helper
export function validateRequired(value: any, fieldName: string): void {
  if (value === undefined || value === null || value === '') {
    throw new ValidationError(`${fieldName} is required`);
  }
}

// ID validation helper
export function validateObjectId(id: string, fieldName = 'ID'): void {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ValidationError(`Invalid ${fieldName} format`);
  }
}

// Async error wrapper for better error handling
export function asyncHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>
) {
  return (...args: T): Promise<R> => {
    return Promise.resolve(fn(...args)).catch((error) => {
      logger.error('Async operation failed', 'AsyncHandler', error);
      throw error;
    });
  };
}

// Rate limiting helper (basic implementation)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(
  identifier: string,
  maxRequests = 100,
  windowMs = 60000
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

// Cleanup old rate limit records
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Cleanup every minute