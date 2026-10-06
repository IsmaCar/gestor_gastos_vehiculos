-- Reconcile "ExpenseCategory" enum with schema.prisma: the "material" value
-- was never adopted in the domain model and is unused in "expenses" data.
-- Postgres has no DROP VALUE for enums, so the type is recreated without it.

ALTER TYPE "ExpenseCategory" RENAME TO "ExpenseCategory_old";

CREATE TYPE "ExpenseCategory" AS ENUM ('combustible', 'taller', 'ITV', 'seguro', 'otros');

ALTER TABLE "expenses" ALTER COLUMN "category" DROP DEFAULT;
ALTER TABLE "expenses" ALTER COLUMN "category" TYPE "ExpenseCategory" USING ("category"::text::"ExpenseCategory");
ALTER TABLE "expenses" ALTER COLUMN "category" SET DEFAULT 'combustible';

DROP TYPE "ExpenseCategory_old";
