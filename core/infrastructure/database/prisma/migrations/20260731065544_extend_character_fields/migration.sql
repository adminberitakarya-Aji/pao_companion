-- CreateEnum
CREATE TYPE "SpeechStyle" AS ENUM ('FORMAL', 'CASUAL', 'PLAYFUL', 'SHY', 'CONFIDENT');

-- AlterTable
ALTER TABLE "companions" ADD COLUMN     "backstory" TEXT,
ADD COLUMN     "speechStyle" "SpeechStyle",
ADD COLUMN     "traits" TEXT[] DEFAULT ARRAY[]::TEXT[];
