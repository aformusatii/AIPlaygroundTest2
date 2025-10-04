import { env } from '../config/env.js';
import { workspacesService } from '../services/workspacesService.js';
import { secretsService } from '../services/secretsService.js';
import { apiKeysService } from '../services/apiKeysService.js';
import { sshKeysService } from '../services/sshKeysService.js';
import { bankCardsService } from '../services/bankCardsService.js';
import { bankAccountsService } from '../services/bankAccountsService.js';

const workspaceSeeds = [
  { name: 'Work Endava', description: 'Client delivery workspace' },
  { name: 'Work MC', description: 'Consulting engagements with MC' },
  { name: 'Personal', description: 'Personal accounts and tools' },
  { name: 'Homelab', description: 'Self-hosted lab secrets' },
];

const ensureWorkspace = async (name: string, description?: string) => {
  const existing = await workspacesService.list({ limit: 100 });
  const match = existing.data.find((workspace) => workspace.name === name);
  if (match) return match;
  return workspacesService.create({ name, description });
};

export const runSeed = async () => {
  const workspaceMap = new Map<string, string>();
  for (const workspace of workspaceSeeds) {
    const record = await ensureWorkspace(workspace.name, workspace.description);
    workspaceMap.set(workspace.name, record.id);
  }

  const endavaWorkspaceId = workspaceMap.get('Work Endava');
  const mcWorkspaceId = workspaceMap.get('Work MC');
  const personalWorkspaceId = workspaceMap.get('Personal');
  const homelabWorkspaceId = workspaceMap.get('Homelab');

  if (!endavaWorkspaceId || !mcWorkspaceId || !personalWorkspaceId || !homelabWorkspaceId) {
    throw new Error('Failed to seed workspaces');
  }

  const secrets = await secretsService.list({ workspaceId: endavaWorkspaceId, limit: 100 });
  if (!secrets.data.some((item) => item.name === 'Acme Dashboard')) {
    await secretsService.create({
      workspaceId: endavaWorkspaceId,
      name: 'Acme Dashboard',
      username: 'deploy_bot',
      password: 'acme-deploy-2024!',
      otpMethod: 'TOTP',
      url: 'https://dash.acme.example',
      notes: 'Shared automation account for blue/green deploys.',
      tags: ['deploy', 'automation'],
    });
  }

  const apiKeys = await apiKeysService.list({ workspaceId: mcWorkspaceId, limit: 100 });
  if (!apiKeys.data.some((item) => item.name === 'Stripe Connect')) {
    await apiKeysService.create({
      workspaceId: mcWorkspaceId,
      name: 'Stripe Connect',
      provider: 'Stripe',
      apiKey: 'sk_live_mocked_1234567890',
      baseUrl: 'https://api.stripe.com',
      scopes: ['charges:read', 'charges:write'],
      environment: 'stage',
      notes: 'Stage key used by integration tests.',
      tags: ['payments', 'stage'],
    });
  }

  const sshKeys = await sshKeysService.list({ workspaceId: homelabWorkspaceId, limit: 100 });
  if (!sshKeys.data.some((item) => item.name === 'NAS Maintenance')) {
    await sshKeysService.create({
      workspaceId: homelabWorkspaceId,
      name: 'NAS Maintenance',
      publicKey: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCrnasPublicKeyMocked',
      privateKey: '-----BEGIN PRIVATE KEY-----\nfake-private-key\n-----END PRIVATE KEY-----',
      comment: 'NAS admin automation key',
      tags: ['homelab', 'infra'],
    });
  }

  const bankCards = await bankCardsService.list({ workspaceId: personalWorkspaceId, limit: 100 });
  if (!bankCards.data.some((item) => item.cardholderName === 'Avery Quinn' && item.brand === 'Visa')) {
    await bankCardsService.create({
      workspaceId: personalWorkspaceId,
      cardholderName: 'Avery Quinn',
      brand: 'Visa',
      cardNumber: '4111111111111111',
      expiryMonth: 11,
      expiryYear: new Date().getFullYear() + 3,
      cvv: '123',
      billingAddress: '123 Market Street, Springfield, USA',
      notes: 'Used for travel bookings only.',
      tags: ['travel'],
    });
  }

  const bankAccounts = await bankAccountsService.list({ workspaceId: personalWorkspaceId, limit: 100 });
  if (!bankAccounts.data.some((item) => item.bankName === 'First Federal')) {
    await bankAccountsService.create({
      workspaceId: personalWorkspaceId,
      bankName: 'First Federal',
      accountHolder: 'Avery Quinn',
      accountNumber: '000123456789',
      iban: 'GB29NWBK60161331926819',
      swiftBic: 'NWBKGB2L',
      routingNumber: '011000138',
      currency: 'USD',
      notes: 'Primary household account.',
      tags: ['household'],
    });
  }

  // eslint-disable-next-line no-console
  console.log('Seed completed using database at', env.dbPath);
};

runSeed()
  .then(() => process.exit(0))
  .catch((error) => {
    // eslint-disable-next-line no-console
    console.error('Seed failed', error);
    process.exit(1);
  });
