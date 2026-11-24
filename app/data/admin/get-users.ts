
import "server-only";

import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "./require-superadmin";

export async function getUsers() {
  await requireSuperAdmin();

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      banned: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
}
