import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/errors.js';
import { env } from '../config/env.js';

export const notFoundHandler = (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Resource not found',
    },
  });
};

export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  let status = 500;
  let message = 'Internal server error';
  let details: unknown;

  if (err instanceof ApiError) {
    status = err.status;
    message = err.message;
    details = err.details;
  } else if (err instanceof Error) {
    message = err.message;
  }

  if (env.nodeEnv !== 'test') {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  res.status(status).json({
    success: false,
    error: {
      message,
      details,
    },
  });
};
