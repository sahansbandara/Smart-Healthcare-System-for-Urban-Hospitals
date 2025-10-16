import { MongoServerError } from 'mongodb';
import mongoose from 'mongoose';
import { ZodError } from 'zod';

type ErrorBody = {
  ok: false;
  error: string;
  details?: unknown;
};

type ErrorResponse = {
  status: number;
  body: ErrorBody;
};

const DEFAULT_ERROR: ErrorResponse = {
  status: 500,
  body: { ok: false, error: 'INTERNAL_ERROR' },
};

export function mapError(error: unknown): ErrorResponse {
  if (error instanceof ZodError) {
    return {
      status: 400,
      body: {
        ok: false,
        error: 'INVALID_INPUT',
        details: error.flatten(),
      },
    };
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return {
      status: 400,
      body: {
        ok: false,
        error: 'VALIDATION_ERROR',
        details: error.errors,
      },
    };
  }

  if (error instanceof mongoose.Error.CastError) {
    return {
      status: 400,
      body: {
        ok: false,
        error: 'INVALID_ID',
        details: { path: error.path, value: error.value },
      },
    };
  }

  if (error instanceof MongoServerError && error.code === 11000) {
    return {
      status: 409,
      body: {
        ok: false,
        error: 'DUPLICATE_KEY',
        details: error.keyValue,
      },
    };
  }

  if (typeof error === 'object' && error && 'status' in error && 'body' in error) {
    const typed = error as ErrorResponse;
    return typed;
  }

  if (error instanceof Error) {
    if (error.name === 'UnauthorizedError') {
      return {
        status: 401,
        body: { ok: false, error: 'UNAUTHORIZED' },
      };
    }

    if (error.message === 'CONFLICT_SLOT') {
      return {
        status: 409,
        body: { ok: false, error: 'CONFLICT_SLOT' },
      };
    }
  }

  return DEFAULT_ERROR;
}
