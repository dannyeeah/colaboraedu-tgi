BEGIN;

ALTER TABLE "uploads"
ADD COLUMN IF NOT EXISTS "fileKey" TEXT;

ALTER TABLE "uploads"
ADD COLUMN IF NOT EXISTS "userId" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "uploads_fileKey_key"
ON "uploads"("fileKey");

CREATE INDEX IF NOT EXISTS "uploads_userId_idx"
ON "uploads"("userId");

COMMIT;