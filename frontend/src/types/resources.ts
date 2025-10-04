export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Secret {
  id: string;
  workspaceId: string;
  name: string;
  username: string;
  password: string;
  otpMethod: 'TOTP' | 'SMS' | 'Email' | 'NONE';
  url?: string;
  notes?: string;
  iconUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SecretForm {
  workspaceId: string;
  name: string;
  username: string;
  password: string;
  otpMethod: Secret['otpMethod'];
  url?: string;
  notes?: string;
  iconUrl?: string;
  tags: string[];
}

export type SecretUpdateForm = Partial<SecretForm>;

export interface ApiKey {
  id: string;
  workspaceId: string;
  name: string;
  provider: string;
  apiKey: string;
  baseUrl?: string;
  scopes?: string[];
  environment: 'dev' | 'stage' | 'prod';
  notes?: string;
  iconUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiKeyForm {
  workspaceId: string;
  name: string;
  provider: string;
  apiKey: string;
  baseUrl?: string;
  scopes?: string[];
  environment: ApiKey['environment'];
  notes?: string;
  iconUrl?: string;
  tags: string[];
}

export type ApiKeyUpdateForm = Partial<ApiKeyForm>;

export interface SshKey {
  id: string;
  workspaceId: string;
  name: string;
  publicKey: string;
  privateKey: string;
  comment?: string;
  notes?: string;
  iconUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SshKeyForm {
  workspaceId: string;
  name: string;
  publicKey: string;
  privateKey: string;
  comment?: string;
  notes?: string;
  iconUrl?: string;
  tags: string[];
}

export type SshKeyUpdateForm = Partial<SshKeyForm>;

export interface BankCard {
  id: string;
  workspaceId: string;
  cardholderName: string;
  brand: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  billingAddress?: string;
  notes?: string;
  iconUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BankCardForm {
  workspaceId: string;
  cardholderName: string;
  brand: string;
  cardNumber: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  billingAddress?: string;
  notes?: string;
  iconUrl?: string;
  tags: string[];
}

export type BankCardUpdateForm = Partial<BankCardForm>;

export interface BankAccount {
  id: string;
  workspaceId: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  iban?: string;
  swiftBic?: string;
  routingNumber?: string;
  currency?: string;
  notes?: string;
  iconUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BankAccountForm {
  workspaceId: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  iban?: string;
  swiftBic?: string;
  routingNumber?: string;
  currency?: string;
  notes?: string;
  iconUrl?: string;
  tags: string[];
}

export type BankAccountUpdateForm = Partial<BankAccountForm>;

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}
