/*
  Warnings:

  - A unique constraint covering the columns `[nome_interesse]` on the table `interesse` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "interesse_nome_interesse_key" ON "interesse"("nome_interesse");
