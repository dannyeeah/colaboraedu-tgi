"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "./require-superadmin";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setUserRole(userId: string) {
  const session = await requireSuperAdmin();

  if (!userId) {
    throw new Error("Usuário inválido.");
  }

  if (session.user.id === userId) {
    throw new Error(
      "Você não pode alterar seu próprio perfil."
    );
  }

  const targetUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
      banned: true,
    },
  });

  if (!targetUser) {
    throw new Error("Usuário não encontrado.");
  }

  if (targetUser.role === "superadmin") {
    throw new Error(
      "O perfil de um superadministrador é protegido."
    );
  }

  if (targetUser.banned) {
    throw new Error(
      "Não é possível promover um usuário banido."
    );
  }

  if (targetUser.role !== "user") {
    throw new Error(
      "Somente estudantes podem ser promovidos a professores."
    );
  }

  await auth.api.setRole({
    body: {
      userId: targetUser.id,
      role: "admin",
    },
    headers: await headers(),
  });

  revalidatePath("/admin/users");
}