import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { buildValidPayload } from '../../auth/helpers/payload.helper'

/**
 * Registers a brand-new user and logs them in, returning their JWT.
 *
 * TODO: reuse `buildValidPayload` (from the auth helpers) to register a
 * user via `POST /api/auth/register`, then log in via `POST /api/auth/login`
 * and return `{ accessToken, userId }` so vehicle e2e tests can:
 *   - send `Authorization: Bearer <accessToken>` on protected requests.
 *   - assert that a created vehicle's `userId` matches this user, not a
 *     value forged in the request body (Scenario 1).
 */
export const createAuthenticatedUser = async (
  app: INestApplication,
): Promise<{ accessToken: string; userId: number }> => {

  const payload = buildValidPayload();

  const registerResponse = await request(app.getHttpServer())
  .post('/api/auth/register')
  .send(payload)
  .expect(201);

  const loginResponse = await request(app.getHttpServer())
  .post('/api/auth/login')
  .send({email: payload.email, password: payload.password})
  .expect(200)

  return { accessToken: loginResponse.body.access_token, userId: registerResponse.body.userId}
};
