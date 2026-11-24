import "server-only";

import { prisma } from "@/lib/db";
import { requireStudent } from "./require-student";

export async function getXpHistory() {
  const session = await requireStudent();

  const transactions = await prisma.xpTransaction.findMany({
    where: {
      userId: session.user.id,
    },
    select: {
      id: true,
      amount: true,
      reason: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });

  return transactions;
}