-- CreateIndex
CREATE INDEX "ActivityGeneration_activityType_outcome_idx" ON "ActivityGeneration"("activityType", "outcome");

-- CreateIndex
CREATE INDEX "ActivityGeneration_source_idx" ON "ActivityGeneration"("source");

-- CreateIndex
CREATE INDEX "ActivityGeneration_createdAt_idx" ON "ActivityGeneration"("createdAt");
