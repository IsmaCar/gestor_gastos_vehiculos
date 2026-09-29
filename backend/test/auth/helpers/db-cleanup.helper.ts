import 'dotenv/config';
import { PrismaClient } from '../../../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Removes every user created by the auth e2e suite so that repeated test
 * runs don't leave residual data behind and can't affect future runs
 * (e.g. unique constraint clashes or unbounded table growth).
 *
 * Matches by the naming conventions used across the suite's payloads:
 * - `buildValidPayload()` -> username/email prefixed with `user_`
 * - Scenario 6 (rate limiting) -> the fixed `ratelimit@example.com` email
 */
export const cleanupTestUsers = async (): Promise<void> => {
  await prisma.user.deleteMany({
    where: {
      OR: [
        { username: { startsWith: 'user_' } },
        { email: { startsWith: 'user_' } },
        { email: 'ratelimit@example.com' },
      ],
    },
  });

  await prisma.$disconnect();
};
