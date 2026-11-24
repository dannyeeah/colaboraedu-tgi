import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function requireCourseOwner(courseId: string) {
  const session = await requireAdmin();

  const course = await prisma.course.findUnique({
    where: {
      id: courseId,
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!course) {
    throw new Error("Curso não encontrado.");
  }

  const isSuperAdmin = session.user.role === "superadmin";
  const isOwner = course.userId === session.user.id;

  if (!isSuperAdmin && !isOwner) {
    throw new Error(
      "Você não possui permissão para gerenciar este curso."
    );
  }

  return {
    session,
    course,
    isSuperAdmin,
    isOwner,
  };
}