import type { Level } from 'level';
import { nanoid } from 'nanoid';
import {
  type ListParams,
  type ListResult,
  type SortDirection,
} from '../types/entities.js';
import { MASK_PLACEHOLDER, maskSensitiveFields } from '../utils/mask.js';
import { badRequest, notFound } from '../utils/errors.js';

export interface ResourceOptions<T extends { id: string }> {
  resourceName: string;
  searchableFields: (keyof T)[];
  sensitiveFields: (keyof T)[];
  workspaceField?: keyof T;
  defaultSort?: string;
}

interface SortDescriptor<T> {
  field: keyof T;
  direction: SortDirection;
}

export class BaseService<T extends { id: string; createdAt: string; updatedAt: string }, CreateInput, UpdateInput> {
  constructor(private readonly store: Level<string, T>, private readonly options: ResourceOptions<T>) {}

  protected parseSort(sort?: string): SortDescriptor<T>[] {
    const fallback = this.options.defaultSort ?? '-updatedAt';
    const raw = sort?.trim().length ? sort : fallback;
    return raw.split(',').map((segment) => {
      const trimmed = segment.trim();
      const direction: SortDirection = trimmed.startsWith('-') ? 'desc' : 'asc';
      const field = (trimmed.replace(/^[-+]/, '') || 'updatedAt') as keyof T;
      return { field, direction };
    });
  }

  protected applySort(items: T[], sort?: string): T[] {
    const descriptors = this.parseSort(sort);
    return items.sort((a, b) => {
      for (const descriptor of descriptors) {
        const aValue = a[descriptor.field];
        const bValue = b[descriptor.field];
        if (aValue === bValue) continue;
        if (aValue === undefined) return descriptor.direction === 'asc' ? -1 : 1;
        if (bValue === undefined) return descriptor.direction === 'asc' ? 1 : -1;
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return descriptor.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        if (aString < bString) return descriptor.direction === 'asc' ? -1 : 1;
        if (aString > bString) return descriptor.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  protected applySearch(items: T[], q?: string): T[] {
    if (!q?.trim()) return items;
    const term = q.trim().toLowerCase();
    return items.filter((item) =>
      this.options.searchableFields.some((field) => {
        const value = item[field];
        if (value === undefined || value === null) return false;
        if (Array.isArray(value)) {
          return value.some((entry) => String(entry).toLowerCase().includes(term));
        }
        return String(value).toLowerCase().includes(term);
      }),
    );
  }

  protected applyWorkspaceFilter(items: T[], workspaceId?: string): T[] {
    if (!this.options.workspaceField || !workspaceId) return items;
    return items.filter((item) => String(item[this.options.workspaceField!]) === workspaceId);
  }

  protected applyTagFilter(items: T[], tags?: string[]): T[] {
    if (!tags?.length) return items;
    return items.filter((item) => {
      const value = (item as unknown as { tags?: string[] }).tags;
      if (!Array.isArray(value)) return false;
      return tags.every((tag) => value.includes(tag));
    });
  }

  protected paginate(items: T[], page = 1, limit = 25): ListResult<T> {
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const normalizedPage = Math.min(Math.max(page, 1), totalPages);
    const start = (normalizedPage - 1) * limit;
    const data = items.slice(start, start + limit);
    return {
      data,
      meta: {
        total,
        page: normalizedPage,
        limit,
        totalPages,
        hasMore: normalizedPage < totalPages,
      },
    };
  }

  protected prepareForReturn(item: T): T {
    return maskSensitiveFields(item, this.options.sensitiveFields as string[]);
  }

  protected normalizeInput(input: Partial<CreateInput & UpdateInput>): Partial<CreateInput & UpdateInput> {
    const normalized = { ...input };
    if ('tags' in normalized && !normalized.tags) {
      (normalized as Record<string, unknown>).tags = [];
    }
    return normalized;
  }

  protected buildEntity(base: Record<string, unknown>, source?: Record<string, unknown>): Record<string, unknown> {
    const entity: Record<string, unknown> = { ...base };
    if (source && 'tags' in source) {
      entity.tags = source.tags ?? [];
    }
    return entity;
  }

  async list(params: ListParams): Promise<ListResult<T>> {
    const page = params.page ?? 1;
    const limit = params.limit ?? 25;
    const items: T[] = [];
    for await (const [, value] of this.store.iterator()) {
      items.push(value);
    }
    let filtered = this.applyWorkspaceFilter(items, params.workspaceId);
    filtered = this.applyTagFilter(filtered, params.tags);
    filtered = this.applySearch(filtered, params.q);
    const sorted = this.applySort(filtered, params.sort);
    const result = this.paginate(sorted, page, limit);
    return {
      data: result.data.map((item) => this.prepareForReturn(item)),
      meta: result.meta,
    };
  }

  async getById(id: string): Promise<T> {
    try {
      const value = await this.store.get(id);
      return this.prepareForReturn(value);
    } catch (error) {
      throw notFound(`${this.options.resourceName} not found`);
    }
  }

  async getRawById(id: string): Promise<T> {
    try {
      return await this.store.get(id);
    } catch (error) {
      throw notFound(`${this.options.resourceName} not found`);
    }
  }

  async create(payload: CreateInput): Promise<T> {
    const normalized = this.normalizeInput(payload) as CreateInput;
    if (this.options.workspaceField && !(normalized as Record<string, unknown>)[this.options.workspaceField]) {
      throw badRequest('workspaceId is required');
    }
    const now = new Date().toISOString();
    const base: Record<string, unknown> = {
      ...(normalized as Record<string, unknown>),
      id: nanoid(),
      createdAt: now,
      updatedAt: now,
    };
    const entity = this.buildEntity(base, normalized as Record<string, unknown>) as T;
    await this.store.put(entity.id, entity);
    return this.prepareForReturn(entity);
  }

  async update(id: string, payload: UpdateInput): Promise<T> {
    const existing = await this.getRawById(id);
    const normalized = this.normalizeInput(payload) as UpdateInput;
    const base: Record<string, unknown> = {
      ...existing,
      ...(normalized as Record<string, unknown>),
      updatedAt: new Date().toISOString(),
    };
    const entity = this.buildEntity(base, normalized as Record<string, unknown>) as T;
    await this.store.put(id, entity);
    return this.prepareForReturn(entity);
  }

  async remove(id: string): Promise<void> {
    await this.store.del(id);
  }

  async copyField(id: string, field: keyof T): Promise<string> {
    const record = await this.getRawById(id);
    const value = record[field];
    if (value === undefined || value === null || value === MASK_PLACEHOLDER) {
      throw badRequest('Field not available for copy');
    }
    return String(value);
  }
}
