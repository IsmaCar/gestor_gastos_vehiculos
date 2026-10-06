-- AlterTable
ALTER TABLE "vehicles" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
-- Partial unique index: only one ACTIVE vehicle may hold a given license plate
-- at any time. Once a vehicle is deactivated (active = false), its licenPlate
-- is freed up for a new owner to register. Multiple deactivated vehicles may
-- share the same plate (sale history), and NULL plates never conflict.
CREATE UNIQUE INDEX "vehicles_licenPlate_active_key" ON "vehicles"("licenPlate") WHERE "active" = true;
