/*
  Warnings:

  - The `status` column on the `match_session` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "MatchSessionStatus" AS ENUM ('VOTING', 'COMPLETED');

-- AlterTable
ALTER TABLE "match_session" DROP COLUMN "status",
ADD COLUMN     "status" "MatchSessionStatus" NOT NULL DEFAULT 'VOTING';
