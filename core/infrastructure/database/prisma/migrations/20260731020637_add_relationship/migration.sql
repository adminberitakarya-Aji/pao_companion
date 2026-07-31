-- CreateTable
CREATE TABLE "relationships" (
    "id" TEXT NOT NULL,
    "companionId" TEXT NOT NULL,
    "affectionPoints" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relationships_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "relationships_companionId_key" ON "relationships"("companionId");

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_companionId_fkey" FOREIGN KEY ("companionId") REFERENCES "companions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
