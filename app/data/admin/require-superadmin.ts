import "server-only";

import { requireAdmin } from "./require-admin";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export async function requireSuperAdmin() {
  const session = await requireAdmin();

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
      banned: true,
    },
  });

  if (!user || user.role !== "superadmin" || user.banned) {
    redirect("/admin");
  }

  return session;
}