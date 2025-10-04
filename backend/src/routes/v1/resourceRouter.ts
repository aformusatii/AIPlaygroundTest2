import { Router } from 'express';
import type { ZodSchema } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { validateBody } from '../../middleware/validateRequest.js';
import { listQuerySchema, type ListQuery } from '../../types/entities.js';
import type { BaseService } from '../../services/baseService.js';
import { badRequest } from '../../utils/errors.js';

interface CopyFieldConfig<T> {
  field: keyof T;
  path: string;
}

interface CreateResourceRouterOptions<T, CreateInput, UpdateInput> {
  copyableFields: CopyFieldConfig<T>[];
  createSchema: ZodSchema<CreateInput>;
  updateSchema: ZodSchema<UpdateInput>;
}

export const createResourceRouter = <
  T extends { id: string; createdAt: string; updatedAt: string },
  CreateInput extends Record<string, unknown>,
  UpdateInput extends Record<string, unknown>,
>(service: BaseService<T, CreateInput, UpdateInput>, options: CreateResourceRouterOptions<T, CreateInput, UpdateInput>) => {
  const router = Router();

  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const parsed = listQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw badRequest('Invalid query parameters', parsed.error.flatten());
      }
      const { data, meta } = await service.list(parsed.data as ListQuery);
      res.json({ success: true, data, meta });
    }),
  );

  router.post(
    '/',
    validateBody(options.createSchema),
    asyncHandler(async (req, res) => {
      const created = await service.create(req.body as CreateInput);
      res.status(201).json({ success: true, data: created });
    }),
  );

  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const item = await service.getById(req.params.id);
      res.json({ success: true, data: item });
    }),
  );

  router.put(
    '/:id',
    validateBody(options.updateSchema),
    asyncHandler(async (req, res) => {
      const updated = await service.update(req.params.id, req.body as UpdateInput);
      res.json({ success: true, data: updated });
    }),
  );

  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      await service.remove(req.params.id);
      res.status(204).send();
    }),
  );

  for (const copyConfig of options.copyableFields) {
    router.post(
      `/:id/secret/${copyConfig.path}/copy`,
      asyncHandler(async (req, res) => {
        const value = await service.copyField(req.params.id, copyConfig.field);
        res.setHeader('Cache-Control', 'no-store');
        res.json({ success: true, value });
      }),
    );
  }

  return router;
};
