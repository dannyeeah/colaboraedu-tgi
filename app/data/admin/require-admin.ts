import "server-only";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      role: true,
      banned: true,
    },
  });

  if (!user || user.banned) {
    redirect("/login");
  }

  if (
    user.role !== "admin" &&
    user.role !== "superadmin"
  ) {
    redirect("/not-admin");
  }

  return {
    ...session,
    user: {
      ...session.user,
      role: user.role,
    },
  };
}