import "server-only";

import { prisma } from "@/lib/db";

export async function unlockAchievements(userId: string) {
  // 1. Consultar o progresso do estudante
  const [completedLessons, completedCourses, xpResult] =
    await Promise.all([
      prisma.lessonProgress.count({
        where: {
          userId,
          completed: true,
        },
      }),

      prisma.xpTransaction.count({
        where: {
          userId,
          reason: "COURSE_COMPLETED",
        },
      }),

      prisma.xpTransaction.aggregate({
        where: {
          userId,
        },
        _sum: {
          amount: true,
        },
      }),
    ]);

  const totalXp = xpResult._sum.amount ?? 0;

  // 2. Definir os requisitos das conquistas
  const rules = [
    {
      code: "FIRST_LESSON",
      unlocked: completedLessons >= 1,
    },
    {
      code: "TEN_LESSONS",
      unlocked: completedLessons >= 10,
    },
    {
      code: "FIRST_COURSE",
      unlocked: completedCourses >= 1,
    },
    {
      code: "XP_500",
      unlocked: totalXp >= 500,
    },
    {
      code: "XP_1500",
      unlocked: totalXp >= 1500,
    },
  ];

  // 3. Identificar as conquistas alcançadas
  const unlockedCodes = rules
    .filter((rule) => rule.unlocked)
    .map((rule) => rule.code);

  if (unlockedCodes.length === 0) {
    return { unlockedCount: 0 };
  }

  // 4. Buscar as medalhas cadastradas
  const achievements = await prisma.achievement.findMany({
    where: {
      code: {
        in: unlockedCodes,
      },
    },
    select: {
      id: true,
    },
  });

  // 5. Registrar as conquistas sem duplicações
  const result = await prisma.userAchievement.createMany({
    data: achievements.map((achievement) => ({
      userId,
      achievementId: achievement.id,
    })),
    skipDuplicates: true,
  });

  return {
    unlockedCount: result.count,
  };
}