
"use server";

import { auth } from "@/lib/auth";
import { requireAdmin } from "./require-admin";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setUserRole(userId: string) {
  const session = await requireAdmin();

  if (session.user.id === userId) {
    throw new Error("Você não pode alterar seu próprio perfil.");
  }

  await auth.api.setRole({
    body: {
      userId,
      role: "admin",
    },
    headers: await headers(),
  });

  revalidatePath("/admin/users");
}
