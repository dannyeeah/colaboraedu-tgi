
import "server-only";

import { prisma } from "@/lib/db";
import { calculateLevel } from "@/lib/gamification";
import { requireStudent } from "./require-student";

export async function getUserGamification() {
  const session = await requireStudent();

  const userId = session.user.id;

  const xpResult = await prisma.xpTransaction.aggregate({
    where: {
      userId,
    },
    _sum: {
      amount: true,
    },
  });

  const totalXp = xpResult._sum.amount ?? 0;

  return calculateLevel(totalXp);
}
