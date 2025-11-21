-- CreateIndex
CREATE INDEX "Agent_userId_createdAt_idx" ON "Agent"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "CallRecording_userId_sentiment_idx" ON "CallRecording"("userId", "sentiment");

-- CreateIndex
CREATE INDEX "CallRecording_userId_createdAt_idx" ON "CallRecording"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Template_category_isPublic_idx" ON "Template"("category", "isPublic");
