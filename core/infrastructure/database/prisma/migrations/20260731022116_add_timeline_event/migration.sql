-- CreateEnum
CREATE TYPE "TimelineEventType" AS ENUM ('FIRST_CONVERSATION', 'RELATIONSHIP_LEVEL_UP');

-- CreateTable
CREATE TABLE "timeline_events" (
    "id" TEXT NOT NULL,
    "companionId" TEXT NOT NULL,
    "eventType" "TimelineEventType" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "timeline_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "timeline_events_companionId_createdAt_idx" ON "timeline_events"("companionId", "createdAt");

-- AddForeignKey
ALTER TABLE "timeline_events" ADD CONSTRAINT "timeline_events_companionId_fkey" FOREIGN KEY ("companionId") REFERENCES "companions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
