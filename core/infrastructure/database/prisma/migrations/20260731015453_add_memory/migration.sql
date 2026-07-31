-- CreateTable
CREATE TABLE "memories" (
    "id" TEXT NOT NULL,
    "companionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "memories_companionId_createdAt_idx" ON "memories"("companionId", "createdAt");

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_companionId_fkey" FOREIGN KEY ("companionId") REFERENCES "companions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
