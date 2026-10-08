import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';

/**
 * TDD RED phase skeleton (unit) for VehiclesService.
 *
 * Source of truth: docs/specs/02-vehicles.md — Scenario 3.1
 *
 * Unlike the DTO-level validations (Scenario 2), this rule depends on
 * comparing the incoming `kmAct` against the value already persisted,
 * so it must be enforced in the service, not in `class-validator`.
 *
 * TODO: once `VehiclesService` exists, import it here instead of this
 * placeholder type.
 */
type VehiclesService = {
  update: (id: number, dto: unknown) => Promise<unknown>;
};

describe('VehiclesService', () => {
  let service: VehiclesService;
  let prisma: PrismaService;

  beforeEach(async () => {
    /**
     * TODO:
     *   1. Provide a mocked `PrismaService` (e.g. `vehicle.findUnique` /
     *      `vehicle.update` as `jest.fn()`), instead of a real DB connection.
     *   2. Register `VehiclesService` as a provider in this TestingModule.
     *   3. Resolve both from the module and assign them above.
     */
    const module: TestingModule = await Test.createTestingModule({
      providers: [],
    }).compile();

    throw new Error('Not implemented');
  });

  describe('Scenario 3.1: update() rejects a lower kmAct', () => {
    it.todo(
      'throws BadRequestException when kmAct is lower than the currently stored value',
    );

    it.todo(
      'never calls prisma.vehicle.update when kmAct is lower than the currently stored value',
    );

    it.todo(
      'allows the update when kmAct is equal to or greater than the currently stored value',
    );
  });
});
