import { z } from 'zod';

export const idSchema = z.string().min(1);
export const timestampSchema = z.string().datetime();

export const baseMetadataSchema = z.object({
  id: idSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

export const workspaceScopedMetadataSchema = baseMetadataSchema.extend({
  workspaceId: z.string().min(1),
  iconUrl: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

const otpMethods = ['TOTP', 'SMS', 'Email', 'NONE'] as const;
export const otpMethodSchema = z.enum(otpMethods);

export const secretCoreSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(1),
  password: z.string().min(1),
  otpMethod: otpMethodSchema,
  url: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  iconUrl: z.string().optional(),
});

export const apiKeyEnvironment = ['dev', 'stage', 'prod'] as const;

export const apiKeyCoreSchema = z.object({
  name: z.string().min(1),
  provider: z.string().min(1),
  apiKey: z.string().min(1),
  baseUrl: z.string().url().optional().or(z.literal('')),
  scopes: z.array(z.string()).optional(),
  environment: z.enum(apiKeyEnvironment),
  notes: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  iconUrl: z.string().optional(),
});

export const sshKeyCoreSchema = z.object({
  name: z.string().min(1),
  publicKey: z.string().min(1),
  privateKey: z.string().min(1),
  comment: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  iconUrl: z.string().optional(),
});

export const bankCardCoreSchema = z.object({
  cardholderName: z.string().min(1),
  brand: z.string().min(1),
  cardNumber: z.string().min(8),
  expiryMonth: z.number().int().min(1).max(12),
  expiryYear: z.number().int().min(new Date().getFullYear()),
  cvv: z.string().min(3),
  billingAddress: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  iconUrl: z.string().optional(),
});

export const bankAccountCoreSchema = z.object({
  bankName: z.string().min(1),
  accountHolder: z.string().min(1),
  accountNumber: z.string().min(4),
  iban: z.string().optional().or(z.literal('')),
  swiftBic: z.string().optional().or(z.literal('')),
  routingNumber: z.string().optional().or(z.literal('')),
  currency: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).optional(),
  iconUrl: z.string().optional(),
});

export const workspaceCoreSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().or(z.literal('')),
});

export const secretCreateSchema = secretCoreSchema.extend({
  workspaceId: z.string().min(1),
  tags: z.array(z.string()).optional(),
});
export const secretUpdateSchema = secretCreateSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const apiKeyCreateSchema = apiKeyCoreSchema.extend({
  workspaceId: z.string().min(1),
  tags: z.array(z.string()).optional(),
});
export const apiKeyUpdateSchema = apiKeyCreateSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const sshKeyCreateSchema = sshKeyCoreSchema.extend({
  workspaceId: z.string().min(1),
  tags: z.array(z.string()).optional(),
});
export const sshKeyUpdateSchema = sshKeyCreateSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const bankCardCreateSchema = bankCardCoreSchema.extend({
  workspaceId: z.string().min(1),
  tags: z.array(z.string()).optional(),
});
export const bankCardUpdateSchema = bankCardCreateSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const bankAccountCreateSchema = bankAccountCoreSchema.extend({
  workspaceId: z.string().min(1),
  tags: z.array(z.string()).optional(),
});
export const bankAccountUpdateSchema = bankAccountCreateSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const workspaceCreateSchema = workspaceCoreSchema;
export const workspaceUpdateSchema = workspaceCoreSchema.partial().refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});

export const listQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(10000).optional().default(25),
    sort: z.string().optional(),
    q: z.string().optional(),
    workspaceId: z.string().optional(),
    tags: z
      .union([
        z.string(),
        z.array(z.string()),
      ])
      .optional(),
  })
  .transform((data) => ({
    ...data,
    tags: Array.isArray(data.tags)
      ? data.tags
      : data.tags
      ? data.tags.split(',').map((tag) => tag.trim()).filter(Boolean)
      : undefined,
  }));

export type SecretCreateInput = z.infer<typeof secretCreateSchema>;
export type SecretUpdateInput = z.infer<typeof secretUpdateSchema>;
export type ApiKeyCreateInput = z.infer<typeof apiKeyCreateSchema>;
export type ApiKeyUpdateInput = z.infer<typeof apiKeyUpdateSchema>;
export type SshKeyCreateInput = z.infer<typeof sshKeyCreateSchema>;
export type SshKeyUpdateInput = z.infer<typeof sshKeyUpdateSchema>;
export type BankCardCreateInput = z.infer<typeof bankCardCreateSchema>;
export type BankCardUpdateInput = z.infer<typeof bankCardUpdateSchema>;
export type BankAccountCreateInput = z.infer<typeof bankAccountCreateSchema>;
export type BankAccountUpdateInput = z.infer<typeof bankAccountUpdateSchema>;
export type WorkspaceCreateInput = z.infer<typeof workspaceCreateSchema>;
export type WorkspaceUpdateInput = z.infer<typeof workspaceUpdateSchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;

export type WorkspaceScopedEntity = z.infer<typeof workspaceScopedMetadataSchema>;
export type BaseEntity = z.infer<typeof baseMetadataSchema>;

export type SecretEntity = WorkspaceScopedEntity & Omit<SecretCreateInput, 'workspaceId'> & { workspaceId: string };
export type ApiKeyEntity = WorkspaceScopedEntity & Omit<ApiKeyCreateInput, 'workspaceId'> & { workspaceId: string };
export type SshKeyEntity = WorkspaceScopedEntity & Omit<SshKeyCreateInput, 'workspaceId'> & { workspaceId: string };
export type BankCardEntity = WorkspaceScopedEntity & Omit<BankCardCreateInput, 'workspaceId'> & { workspaceId: string };
export type BankAccountEntity = WorkspaceScopedEntity & Omit<BankAccountCreateInput, 'workspaceId'> & { workspaceId: string };
export type WorkspaceEntity = BaseEntity & { name: string; description?: string | undefined };

export type SortDirection = 'asc' | 'desc';

export interface ListParams {
  page?: number;
  limit?: number;
  sort?: string;
  q?: string;
  workspaceId?: string;
  tags?: string[];
}

export interface ListResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };
}
