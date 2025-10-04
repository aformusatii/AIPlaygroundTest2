import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { badRequest } from '../utils/errors.js';

export const validateBody = <T>(schema: ZodSchema<T>) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    console.error('Validation error:', result);
    console.error('Validation error:', result.error);
    return next(badRequest('Validation failed', result.error.flatten()));
  }
  req.body = result.data;
  return next();
};

export const validateQuery = <T>(schema: ZodSchema<T>) => (req: Request, _res: Response, next: NextFunction) => {
  const result = schema.safeParse(req.query);
  if (!result.success) {
    return next(badRequest('Invalid query parameters', result.error.flatten()));
  }
  req.query = result.data as unknown as Request['query'];
  return next();
};
