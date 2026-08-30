-- CreateEnum
CREATE TYPE "ActivityDifficulty" AS ENUM ('EASY', 'STANDARD', 'CHALLENGING');

-- CreateTable
CREATE TABLE "WordList" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" UUID NOT NULL,
    "wordListId" UUID NOT NULL,
    "english" TEXT NOT NULL,
    "ipa" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordPhoneme" (
    "id" UUID NOT NULL,
    "wordId" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "ipaSymbol" TEXT NOT NULL,
    "grapheme" TEXT NOT NULL,
    "exampleWord" TEXT NOT NULL,
    "spokenName" TEXT NOT NULL,

    CONSTRAINT "WordPhoneme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordleConfiguration" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "wordId" UUID NOT NULL,
    "difficulty" "ActivityDifficulty" NOT NULL DEFAULT 'STANDARD',
    "hintsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordleConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WordSearchConfiguration" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "wordListId" UUID NOT NULL,
    "difficulty" "ActivityDifficulty" NOT NULL DEFAULT 'STANDARD',
    "seed" INTEGER NOT NULL,
    "hintsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WordSearchConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WordList_name_key" ON "WordList"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Word_wordListId_english_key" ON "Word"("wordListId", "english");

-- CreateIndex
CREATE UNIQUE INDEX "WordPhoneme_wordId_position_key" ON "WordPhoneme"("wordId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "WordleConfiguration_name_key" ON "WordleConfiguration"("name");

-- CreateIndex
CREATE INDEX "WordleConfiguration_wordId_idx" ON "WordleConfiguration"("wordId");

-- CreateIndex
CREATE UNIQUE INDEX "WordSearchConfiguration_name_key" ON "WordSearchConfiguration"("name");

-- CreateIndex
CREATE INDEX "WordSearchConfiguration_wordListId_idx" ON "WordSearchConfiguration"("wordListId");

-- AddForeignKey
ALTER TABLE "Word" ADD CONSTRAINT "Word_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "WordList"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordPhoneme" ADD CONSTRAINT "WordPhoneme_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordleConfiguration" ADD CONSTRAINT "WordleConfiguration_wordId_fkey" FOREIGN KEY ("wordId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WordSearchConfiguration" ADD CONSTRAINT "WordSearchConfiguration_wordListId_fkey" FOREIGN KEY ("wordListId") REFERENCES "WordList"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
