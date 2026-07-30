/*
  Warnings:

  - You are about to drop the column `password` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerId]` on the table `companions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appearanceDescription` to the `companions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `personaType` to the `companions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `passwordHash` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PersonaType" AS ENUM ('GIRLFRIEND', 'BOYFRIEND');

-- CreateEnum
CREATE TYPE "AvatarStatus" AS ENUM ('PENDING', 'GENERATING', 'READY', 'FAILED');

-- AlterTable
ALTER TABLE "companions" ADD COLUMN     "appearanceDescription" TEXT NOT NULL,
ADD COLUMN     "avatarStatus" "AvatarStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "personaType" "PersonaType" NOT NULL,
ADD COLUMN     "personalityDescription" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "password",
ADD COLUMN     "passwordHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "companions_ownerId_key" ON "companions"("ownerId");
