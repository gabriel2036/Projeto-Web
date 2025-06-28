/*
  Warnings:

  - You are about to drop the `match` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "MatchAction" AS ENUM ('ACCEPTED', 'DECLINED');

-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_id_user1_fkey";

-- DropForeignKey
ALTER TABLE "match" DROP CONSTRAINT "match_id_user2_fkey";

-- DropTable
DROP TABLE "match";

-- CreateTable
CREATE TABLE "friendship" (
    "id_requester" INTEGER NOT NULL,
    "id_addressee" INTEGER NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "friendship_pkey" PRIMARY KEY ("id_requester","id_addressee")
);

-- CreateTable
CREATE TABLE "match_session" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'VOTING',
    "creator_id" INTEGER NOT NULL,

    CONSTRAINT "match_session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "match_participant" (
    "session_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,

    CONSTRAINT "match_participant_pkey" PRIMARY KEY ("session_id","user_id")
);

-- CreateTable
CREATE TABLE "match_vote" (
    "session_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "interest_id" INTEGER NOT NULL,
    "action" "MatchAction" NOT NULL,

    CONSTRAINT "match_vote_pkey" PRIMARY KEY ("session_id","user_id","interest_id")
);

-- CreateTable
CREATE TABLE "match_result" (
    "session_id" INTEGER NOT NULL,
    "interest_id" INTEGER NOT NULL,

    CONSTRAINT "match_result_pkey" PRIMARY KEY ("session_id","interest_id")
);

-- AddForeignKey
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_id_requester_fkey" FOREIGN KEY ("id_requester") REFERENCES "usuario"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friendship" ADD CONSTRAINT "friendship_id_addressee_fkey" FOREIGN KEY ("id_addressee") REFERENCES "usuario"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_session" ADD CONSTRAINT "match_session_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "usuario"("id_user") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participant" ADD CONSTRAINT "match_participant_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "match_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_participant" ADD CONSTRAINT "match_participant_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_vote" ADD CONSTRAINT "match_vote_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "match_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_vote" ADD CONSTRAINT "match_vote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "usuario"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_vote" ADD CONSTRAINT "match_vote_interest_id_fkey" FOREIGN KEY ("interest_id") REFERENCES "interesse"("id_interesse") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_result" ADD CONSTRAINT "match_result_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "match_session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_result" ADD CONSTRAINT "match_result_interest_id_fkey" FOREIGN KEY ("interest_id") REFERENCES "interesse"("id_interesse") ON DELETE CASCADE ON UPDATE CASCADE;
