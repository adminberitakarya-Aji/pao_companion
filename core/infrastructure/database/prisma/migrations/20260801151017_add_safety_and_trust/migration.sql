/*
  Warnings:

  - Added the required column `dateOfBirth` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ModerationCategory" AS ENUM ('SEXUAL_MINOR', 'SEXUAL_NONCONSENSUAL', 'SELF_HARM_INSTRUCTION', 'VIOLENCE_EXTREME', 'ILLEGAL_ACTIVITY', 'HATE_HARASSMENT');

-- CreateEnum
CREATE TYPE "ModerationAction" AS ENUM ('FLAG', 'BLOCK');

-- CreateEnum
CREATE TYPE "ModerationSource" AS ENUM ('USER', 'COMPANION');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "aiDisclosureAckedAt" TIMESTAMP(3),
ADD COLUMN     "anonymizedAt" TIMESTAMP(3),
ADD COLUMN     "dateOfBirth" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "moderation_flags" (
    "id" TEXT NOT NULL,
    "companionId" TEXT NOT NULL,
    "conversationId" TEXT,
    "messageId" TEXT,
    "source" "ModerationSource" NOT NULL,
    "category" "ModerationCategory" NOT NULL,
    "action" "ModerationAction" NOT NULL,
    "matchedTerm" TEXT NOT NULL,
    "contentSnippet" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderation_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crisis_events" (
    "id" TEXT NOT NULL,
    "companionId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "messageSnippet" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crisis_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "moderation_flags_companionId_createdAt_idx" ON "moderation_flags"("companionId", "createdAt");

-- CreateIndex
CREATE INDEX "crisis_events_companionId_createdAt_idx" ON "crisis_events"("companionId", "createdAt");

-- AddForeignKey
ALTER TABLE "moderation_flags" ADD CONSTRAINT "moderation_flags_companionId_fkey" FOREIGN KEY ("companionId") REFERENCES "companions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crisis_events" ADD CONSTRAINT "crisis_events_companionId_fkey" FOREIGN KEY ("companionId") REFERENCES "companions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
