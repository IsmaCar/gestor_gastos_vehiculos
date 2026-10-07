import 'dotenv/config';
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { cleanupTestUsers } from '../../auth/helpers/db-cleanup.helper';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Removes every vehicle (and its owning test user) created by this suite,
 * following the same intent as `cleanupTestUsers` in test/auth/helpers.
 *
 * Vehicles are deleted first (matching by the `plate_` prefix used in
 * `buildValidVehiclePayload`) because they depend on the FK to `User`;
 * only then is `cleanupTestUsers` delegated to for removing the owners.
 */
export const cleanupTestVehicles = async (): Promise<void> => {
  await prisma.vehicle.deleteMany({ where: { licenPlate: {startsWith: 'plate_'} }})
  await cleanupTestUsers();
  await prisma.$disconnect();
};
