import request from 'supertest';
import { app } from '../src/index.js';

let workspaceId: string;

describe('Secretarium API', () => {
  it('creates a workspace', async () => {
    const response = await request(app).post('/api/v1/workspaces').send({
      name: 'QA Workspace',
      description: 'Workspace used in automated tests',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    workspaceId = response.body.data.id;
    expect(workspaceId).toBeDefined();
  });

  it('creates and masks a secret', async () => {
    const response = await request(app)
      .post('/api/v1/secrets')
      .send({
        workspaceId,
        name: 'Test Admin',
        username: 'admin@example.com',
        password: 'super-secret-password',
        otpMethod: 'Email',
        url: 'https://portal.example.com',
        notes: 'Created during automated test',
        tags: ['test'],
      });

    expect(response.status).toBe(201);
    expect(response.body.data.password).toBe('******');
  });

  it('lists secrets with workspace filter and masked values', async () => {
    const response = await request(app).get('/api/v1/secrets').query({ workspaceId });
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
    const secret = response.body.data.find((item: any) => item.name === 'Test Admin');
    expect(secret).toBeDefined();
    expect(secret.password).toBe('******');
    expect(response.body.meta.total).toBeGreaterThan(0);
  });

  it('supports search and sort options', async () => {
    await request(app)
      .post('/api/v1/api-keys')
      .send({
        workspaceId,
        name: 'Search Test Key',
        provider: 'SearchProvider',
        apiKey: 'search-key-1',
        baseUrl: 'https://api.search.dev',
        scopes: ['search:read'],
        environment: 'dev',
        tags: ['integration'],
      });

    const response = await request(app)
      .get('/api/v1/api-keys')
      .query({ workspaceId, q: 'search test', sort: '-createdAt' });

    expect(response.status).toBe(200);
    expect(response.body.data[0].name).toBe('Search Test Key');
    expect(response.body.data[0].apiKey).toBe('******');
  });

  it('copies sensitive fields via copy endpoint', async () => {
    const listResponse = await request(app).get('/api/v1/secrets').query({ workspaceId });
    const secret = listResponse.body.data.find((item: any) => item.name === 'Test Admin');
    expect(secret).toBeDefined();

    const copyResponse = await request(app).post(`/api/v1/secrets/${secret.id}/secret/password/copy`);
    expect(copyResponse.status).toBe(200);
    expect(copyResponse.body.value).toBe('super-secret-password');
  });
});
