
import "server-only";

import { prisma } from "@/lib/db";
import { requireStudent } from "./require-student";

export async function getNextLesson(courseId: string) {
  const session = await requireStudent();

  // Verifica se o aluno está matriculado no curso
  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId,
      },
    },
    select: {
      status: true,
    },
  });

  if (enrollment?.status !== "Active") {
    return null;
  }

  // Busca a primeira aula ainda não concluída
  const nextLesson = await prisma.lesson.findFirst({
    where: {
      Chapter: {
        courseId,
      },
      progress: {
        none: {
          userId: session.user.id,
          completed: true,
        },
      },
    },
    orderBy: [
      {
        Chapter: {
          position: "asc",
        },
      },
      {
        position: "asc",
      },
    ],
    select: {
      id: true,
    },
  });

  // Retorna a próxima aula pendente
  if (nextLesson) {
    return nextLesson.id;
  }

  // Se todas foram concluídas, retorna a primeira aula
  const firstLesson = await prisma.lesson.findFirst({
    where: {
      Chapter: {
        courseId,
      },
    },
    orderBy: [
      {
        Chapter: {
          position: "asc",
        },
      },
      {
        position: "asc",
      },
    ],
    select: {
      id: true,
    },
  });

  return firstLesson?.id ?? null;
}
