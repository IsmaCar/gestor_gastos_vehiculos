import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { buildValidPayload } from '../../auth/helpers/payload.helper'

/**
 * Registers a brand-new user and logs them in, returning their JWT.
 *
 * Reuses `buildValidPayload` (from the auth helpers) so the created user
 * follows the same `user_` naming convention cleaned up by
 * `cleanupTestUsers`. Vehicle e2e tests use the returned `accessToken` to
 * authenticate requests and `userId` to assert the vehicle's real owner
 * (Scenario 1).
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
