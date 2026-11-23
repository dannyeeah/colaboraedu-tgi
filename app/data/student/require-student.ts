
import "server-only";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function requireStudent() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Estudantes e administradores podem acessar os cursos.
  if (
    session.user.role !== "user" &&
    session.user.role !== "admin"
  ) {
    redirect("/login");
  }

  return session;
}
