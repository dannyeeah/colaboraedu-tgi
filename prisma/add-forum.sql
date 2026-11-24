BEGIN;

-- Tabela de comentários e respostas
CREATE TABLE "ForumComment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ForumComment_pkey" PRIMARY KEY ("id"),

    CONSTRAINT "ForumComment_userId_fkey"
        FOREIGN KEY ("userId")
        REFERENCES "user"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT "ForumComment_lessonId_fkey"
        FOREIGN KEY ("lessonId")
        REFERENCES "Lesson"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT "ForumComment_parentId_fkey"
        FOREIGN KEY ("parentId")
        REFERENCES "ForumComment"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Tabela de menções de usuários
CREATE TABLE "ForumMention" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ForumMention_pkey" PRIMARY KEY ("id"),

    CONSTRAINT "ForumMention_commentId_fkey"
        FOREIGN KEY ("commentId")
        REFERENCES "ForumComment"("id")
        ON DELETE CASCADE ON UPDATE CASCADE,

    CONSTRAINT "ForumMention_userId_fkey"
        FOREIGN KEY ("userId")
        REFERENCES "user"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

-- Índices para melhorar o desempenho
CREATE INDEX "ForumComment_userId_idx"
ON "ForumComment"("userId");

CREATE INDEX "ForumComment_lessonId_createdAt_idx"
ON "ForumComment"("lessonId", "createdAt");

CREATE INDEX "ForumComment_parentId_idx"
ON "ForumComment"("parentId");

CREATE INDEX "ForumMention_userId_idx"
ON "ForumMention"("userId");

-- Impedir menções duplicadas no mesmo comentário
CREATE UNIQUE INDEX "ForumMention_commentId_userId_key"
ON "ForumMention"("commentId", "userId");

COMMIT;