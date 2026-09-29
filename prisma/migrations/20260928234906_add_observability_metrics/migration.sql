-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('Wordle', 'WORD_SEARCH');

-- CreateEnum
CREATE TYPE "GenerationOutcome" AS ENUM ('SUCCESS', 'FAILURE');

-- CreateEnum
CREATE TYPE "MetricSource" AS ENUM ('LIVE', 'SIMULATED');

-- CreateTable
CREATE TABLE "ActivityGeneration" (
    "id" UUID NOT NULL,
    "activityType" "ActivityType" NOT NULL,
    "outcome" "GenerationOutcome" NOT NULL,
    "source" "MetricSource" NOT NULL DEFAULT 'LIVE',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" UUID NOT NULL,
    "path" TEXT NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "source" "MetricSource" NOT NULL DEFAULT 'LIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_path_idx" ON "PageView"("path");

-- CreateIndex
CREATE INDEX "PageView_source_idx" ON "PageView"("source");

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");
