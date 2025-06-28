/*
  Warnings:

  - You are about to drop the `Friendship` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_senderId_fkey";

-- DropTable
DROP TABLE "Friendship";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "usuario" (
    "id_user" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "interesse" (
    "id_interesse" SERIAL NOT NULL,
    "nome_interesse" TEXT NOT NULL,
    "imagem_url" TEXT,

    CONSTRAINT "interesse_pkey" PRIMARY KEY ("id_interesse")
);

-- CreateTable
CREATE TABLE "interesse_usuario" (
    "id_user" INTEGER NOT NULL,
    "id_interesse" INTEGER NOT NULL,
    "tipo_interesse" TEXT,

    CONSTRAINT "interesse_usuario_pkey" PRIMARY KEY ("id_user","id_interesse")
);

-- CreateTable
CREATE TABLE "match" (
    "id_user1" INTEGER NOT NULL,
    "id_user2" INTEGER NOT NULL,

    CONSTRAINT "match_pkey" PRIMARY KEY ("id_user1","id_user2")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_email_key" ON "usuario"("email");

-- AddForeignKey
ALTER TABLE "interesse_usuario" ADD CONSTRAINT "interesse_usuario_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "usuario"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interesse_usuario" ADD CONSTRAINT "interesse_usuario_id_interesse_fkey" FOREIGN KEY ("id_interesse") REFERENCES "interesse"("id_interesse") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_id_user1_fkey" FOREIGN KEY ("id_user1") REFERENCES "usuario"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match" ADD CONSTRAINT "match_id_user2_fkey" FOREIGN KEY ("id_user2") REFERENCES "usuario"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;
