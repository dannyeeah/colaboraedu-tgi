import "server-only";

import { prisma } from "@/lib/db";
import { requireStudent } from "./require-student";
import { unlockAchievements } from "@/lib/achievements";

export async function getUserAchievements() {
  const session = await requireStudent();
  const userId = session.user.id;

  // Verificar conquistas com base no progresso existente
  await unlockAchievements(userId);

  // Buscar todas as medalhas disponíveis
  const achievements = await prisma.achievement.findMany({
    include: {
      users: {
        where: {
          userId,
        },
        select: {
          unlockedAt: true,
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Identificar medalhas conquistadas e bloqueadas
  return achievements.map((achievement) => ({
    id: achievement.id,
    code: achievement.code,
    title: achievement.title,
    description: achievement.description,
    icon: achievement.icon,
    unlocked: achievement.users.length > 0,
    unlockedAt: achievement.users[0]?.unlockedAt ?? null,
  }));
}