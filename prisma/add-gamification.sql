
-- GAMIFICAÇÃO DO COLABORAEDU
-- XP, conquistas, desafios e ranking

CREATE TABLE IF NOT EXISTS "XpTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpTransaction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "XpTransaction_reference_key"
ON "XpTransaction"("reference");

CREATE INDEX IF NOT EXISTS "XpTransaction_userId_idx"
ON "XpTransaction"("userId");

ALTER TABLE "XpTransaction"
ADD CONSTRAINT "XpTransaction_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "user"("id")
ON DELETE CASCADE
ON UPDATE CAS;


-- CONQUISTAS DISPONÍVEIS

CREATE TABLE IF NOT EXISTS "Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Achievement_code_key"
ON "Achievement"("code");


-- CONQUISTAS DESBLOQUEADAS PELOS USUÁRIOS

CREATE TABLE IF NOT EXISTS "UserAchievement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserAchievement_userId_achievementId_key"
ON "UserAchievement"("userId", "achievementId");

CREATE INDEX IF NOT EXISTS "UserAchievement_achievementId_idx"
ON "UserAchievement"("achievementId");

ALTER TABLE "UserAchievement"
ADD CONSTRAINT "UserAchievement_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "user"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "UserAchievement"
ADD CONSTRAINT "UserAchievement_achievementId_fkey"
FOREIGN KEY ("achievementId")
REFERENCES "Achievement"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;


-- DESAFIOS DISPONÍVEIS

CREATE TABLE IF NOT EXISTS "Challenge" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target" INTEGER NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Challenge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Challenge_code_key"
ON "Challenge"("code");


-- PROGRESSO DOS DESAFIOS

CREATE TABLE IF NOT EXISTS "UserChallenge" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "UserChallenge_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "UserChallenge_userId_challengeId_key"
ON "UserChallenge"("userId", "challengeId");

CREATE INDEX IF NOT EXISTS "UserChallenge_challengeId_idx"
ON "UserChallenge"("challengeId");

ALTER TABLE "UserChallenge"
ADD CONSTRAINT "UserChallenge_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "user"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "UserChallenge"
ADD CONSTRAINT "UserChallenge_challengeId_fkey"
FOREIGN KEY ("challengeId")
REFERENCES "Challenge"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;
