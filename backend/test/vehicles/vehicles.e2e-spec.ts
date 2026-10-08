import { INestApplication } from '@nestjs/common';
import { createTestApp } from '../auth/helpers/app.helper';
import { buildValidVehiclePayload } from './helpers/vehicle-payload.helper';
import { createAuthenticatedUser } from './helpers/auth-token.helper';
import { cleanupTestVehicles } from './helpers/db-cleanup.helper';
import request from 'supertest';

/**
 * TDD RED phase skeletons for the Vehicle Management module.
 *
 * Source of truth: docs/specs/02-vehicles.md
 *
 * These specs describe the expected behaviour of `/api/vehicles` endpoints
 * before the `VehiclesModule` is implemented. They are expected to fail
 * until the feature is built (RED -> GREEN -> REFACTOR).
 */
describe('VehiclesController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  afterAll(async () => {
    await cleanupTestVehicles();
  });

  describe('Scenario 1: Successful Vehicle Creation', () => {
    it('1.1 creates a vehicle for the authenticated user with 201 Created, ignoring any userId sent in the body', async () =>{
    const { accessToken, userId } = await createAuthenticatedUser(app);
    const payload = { ...buildValidVehiclePayload(), userId: userId + 9999 };
    
    const response = await request(app.getHttpServer())
    .post('/api/vehicle/create')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(payload)

    expect(response.status).toBe(201)
    expect(response.body.userId).toBe(userId)
    expect(response.body.licenPlate).toBe(payload.licenPlate)
    });
  });

  describe('Scenario 2: Vehicle Type Enum Validation', () => {
    it('2.1 rejects a vehicle payload with a type outside the VehicleType enum with 400 Bad Request', async () => {
      const payload = { ...buildValidVehiclePayload(), type: 'truck'};
      const { accessToken } = await createAuthenticatedUser(app);

      return await request(app.getHttpServer())
      .post('/api/vehicle/create')
      .send(payload)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(400)
    });
  });

  describe('Scenario 3.2: Odometer (kmAct) Cannot Be Decreased', () => {
    it.todo(
      '3.2.1 rejects PATCH /api/vehicles/:id with a kmAct lower than the currently stored value, with 400 Bad Request',
    );

    it.todo(
      '3.2.2 leaves the stored kmAct unchanged after a rejected update attempt',
    );
  });

  describe('Scenario 4.1: Blocking Duplicate Active Registration', () => {
    it.todo(
      '4.1.1 blocks a second user from registering the same licenPlate while the original vehicle is still active, with 409 Conflict',
    );
  });

  describe('Scenario 4.2: Deregistering a Vehicle (Soft Delete)', () => {
    it.todo(
      '4.2.1 deactivates a vehicle via DELETE /api/vehicles/:id without physically deleting the row',
    );

    it.todo(
      '4.2.2 preserves the vehicle historical Expense records after deregistration',
    );
  });

  describe('Scenario 4.3: Reusing a Plate After Deregistration', () => {
    it.todo(
      '4.3.1 allows a new user to register a vehicle with a licenPlate that belonged to a now-deregistered vehicle, with 201 Created',
    );
  });

  describe('Scenario 5: Listing Own Vehicles', () => {
    it('5.1 returns 200 OK with only the vehicles owned by the authenticated user', async () => {
      const userA = await createAuthenticatedUser(app);
      const userB = await createAuthenticatedUser(app);

      const vehicleA = await request(app.getHttpServer())
        .post('/api/vehicle/create')
        .set('Authorization', `Bearer ${userA.accessToken}`)
        .send(buildValidVehiclePayload());

      await request(app.getHttpServer())
        .post('/api/vehicle/create')
        .set('Authorization', `Bearer ${userB.accessToken}`)
        .send(buildValidVehiclePayload());

      const response = await request(app.getHttpServer())
        .get('/api/vehicle')
        .set('Authorization', `Bearer ${userA.accessToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(
        response.body.every((vehicle: { userId: number }) => vehicle.userId === userA.userId),
      ).toBe(true);
      expect(
        response.body.some(
          (vehicle: { id: number }) => vehicle.id === vehicleA.body.id,
        ),
      ).toBe(true);
    });
  });

  describe('Scenario 6: Fetching a Single Vehicle Scoped to Its Owner', () => {
    it('6.1 returns 200 OK with the vehicle when requested by its owner', async () => {
      const owner = await createAuthenticatedUser(app);

      const createResponse = await request(app.getHttpServer())
        .post('/api/vehicle/create')
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send(buildValidVehiclePayload());

      const response = await request(app.getHttpServer())
        .get(`/api/vehicle/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${owner.accessToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(createResponse.body.id);
      expect(response.body.userId).toBe(owner.userId);
    });

    it('6.2 returns 404 Not Found when a non-owner requests the vehicle by id', async () => {
      const owner = await createAuthenticatedUser(app);
      const nonOwner = await createAuthenticatedUser(app);

      const createResponse = await request(app.getHttpServer())
        .post('/api/vehicle/create')
        .set('Authorization', `Bearer ${owner.accessToken}`)
        .send(buildValidVehiclePayload());

      const response = await request(app.getHttpServer())
        .get(`/api/vehicle/${createResponse.body.id}`)
        .set('Authorization', `Bearer ${nonOwner.accessToken}`);

      expect(response.status).toBe(404);
    });
  });
});
