import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { buildValidPayload } from './helpers/payload.helper';
import { createTestApp } from './helpers/app.helper';
import { cleanupTestUsers } from './helpers/db-cleanup.helper';

/**
 * TDD RED phase skeletons for the Authentication & User Management module.
 *
 * Source of truth: docs/specs/01-authenticaction.md
 *
 * These specs describe the expected behaviour of `POST /api/auth/register`
 * and `POST /api/auth/login` before the `AuthModule` is implemented.
 * They are expected to fail until the feature is built (RED -> GREEN -> REFACTOR).
 */
describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await cleanupTestUsers();
  });

  describe('Scenario 1: Successful Registration & Login Flow', () => {
    it('registers a new user and logs in returning a sanitized user and a JWT token', async () => {
      const payload = buildValidPayload();

      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(payload)
        .expect(201);

      expect(registerResponse.body.password).toBeUndefined();

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: payload.email, password: payload.password })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('access_token');
      expect(typeof loginResponse.body.access_token).toBe('string');
      expect(loginResponse.body.access_token.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario 2: Password Complexity Validations', () => {
    it('2.1 rejects a password under the minimum length with 400 Bad Request', () => {
      const payload = { ...buildValidPayload(), password: 'Sh0rt!' };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(payload)
        .expect(400);
    });

    it('2.2 rejects a password missing an uppercase character with 400 Bad Request', () => {
      const payload = { ...buildValidPayload(), password: 'lowercase1!' };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(payload)
        .expect(400);
    });

    it('2.3 rejects a password missing a special character with 400 Bad Request', () => {
      const payload = { ...buildValidPayload(), password: 'NoSpecial1' };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(payload)
        .expect(400);
    });
  });

  describe('Scenario 3: Structural Input Validation', () => {
    it('rejects a malformed email with 400 Bad Request', () => {
      const payload = { ...buildValidPayload(), email: 'invalid-email' };

      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(payload)
        .expect(400);
    });
  });

  describe('Scenario 4: Authentication & JWT Token', () => {
    it('logs in an existing user and returns a non-empty access_token', async () => {
      const payload = buildValidPayload();

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(payload)
        .expect(201);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: payload.email, password: payload.password })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('access_token');
      expect(loginResponse.body.access_token).toEqual(expect.any(String));
      expect(loginResponse.body.access_token.length).toBeGreaterThan(0);
    });
  });

  describe('Scenario 5: Edge Case - Duplicate Account Registration', () => {
    it('blocks registering a duplicate email with 409 Conflict (or 400 Bad Request)', async () => {
      const payload = buildValidPayload();

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(payload)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...buildValidPayload(), email: payload.email });

      expect([409, 400]).toContain(response.status);
    });
  });

  describe('Scenario 6: Security - Rate Limiting', () => {
    it('throttles the 6th request within a 1-minute window with 429 Too Many Requests', async () => {
      const credentials = { email: 'ratelimit@example.com', password: 'WrongPass1!' };
      const responses: request.Response[] = [];

      for (let i = 0; i < 6; i++) {
        const response = await request(app.getHttpServer())
          .post('/api/auth/login')
          .send(credentials);
        responses.push(response);
      }

      expect(responses[5].status).toBe(429);
    });
  });
});
