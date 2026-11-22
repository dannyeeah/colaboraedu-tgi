
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LessonProgress_lessonId_idx"
ON "LessonProgress"("lessonId");

CREATE UNIQUE INDEX "LessonProgress_userId_lessonId_key"
ON "LessonProgress"("userId", "lessonId");

ALTER TABLE "LessonProgress"
ADD CONSTRAINT "LessonProgress_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "user"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "LessonProgress"
ADD CONSTRAINT "LessonProgress_lessonId_fkey"
FOREIGN KEY ("lessonId")
REFERENCES "Lesson"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
