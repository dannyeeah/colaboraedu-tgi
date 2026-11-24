import "server-only";

import { prisma } from "@/lib/db";
import { requireStudent } from "@/app/data/student/require-student";

export async function requireForumAccess(lessonId: string) {
  const session = await requireStudent();

  const user = await prisma.user.findUnique({
    where: {
      id: session.user.id,
    },
    select: {
      id: true,
      role: true,
      banned: true,
    },
  });

  if (!user || user.banned) {
    throw new Error("Usuário sem permissão de acesso.");
  }

  if (
    user.role !== "user" &&
    user.role !== "admin" &&
    user.role !== "superadmin"
  ) {
    throw new Error("Perfil sem permissão de acesso.");
  }

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: lessonId,
    },
    select: {
      id: true,
      Chapter: {
        select: {
          Course: {
            select: {
              id: true,
              userId: true,
              slug: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    throw new Error("Aula não encontrada.");
  }

  const course = lesson.Chapter.Course;

  const isSuperAdmin = user.role === "superadmin";

  const isOwner =
    user.role === "admin" &&
    course.userId === user.id;

  if (!isSuperAdmin && !isOwner) {
    if (course.status !== "Published") {
      throw new Error("Este curso não está disponível.");
    }

    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
    });

    if (!enrollment || enrollment.status !== "Active") {
      throw new Error(
        "Você precisa estar matriculado neste curso para participar do fórum."
      );
    }
  }

  return {
    userId: user.id,
    role: user.role,
    lessonId: lesson.id,
    courseId: course.id,
    courseSlug: course.slug,
    isOwner,
    isSuperAdmin,
    canModerate: isOwner || isSuperAdmin,
    canEditAnyComment: isSuperAdmin,
  };
}