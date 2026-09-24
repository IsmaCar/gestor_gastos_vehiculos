-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('coche', 'moto', 'furgoneta');

-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('combustible', 'taller', 'material', 'ITV', 'seguro', 'otros');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "licenPlate" TEXT,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "kmAct" INTEGER NOT NULL,
    "type" "VehicleType" NOT NULL DEFAULT 'coche',

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" SERIAL NOT NULL,
    "vehicleId" INTEGER NOT NULL,
    "category" "ExpenseCategory" NOT NULL DEFAULT 'combustible',
    "concept" TEXT NOT NULL,
    "import" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "kms" INTEGER,
    "billUrl" TEXT,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
