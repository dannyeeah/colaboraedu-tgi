
import { prisma } from "@/lib/db";

export async function buscarAulaTutor(aulaId: string) {
  const aula = await prisma.lesson.findFirst({
    where: {
      id: aulaId,
      Chapter: { Course: { status: "Published" } },
    },
    select: {
      id: true,
      title: true,
      description: true,
      Chapter: {
        select: {
          title: true,
          Course: {
            select: {
              id: true,
              title: true,
              description: true,
              smallDescription: true,
              level: true,
              category: true,
            },
          },
        },
      },
    },
  });

  return aula;
}

export async function buscarCursoTutor(cursoId: string) {
  const curso = await prisma.course.findFirst({
    where: { id: cursoId, status: "Published" },
    select: {
      id: true,
      title: true,
      description: true,
      smallDescription: true,
      level: true,
      category: true,
      chapter: {
        orderBy: {
          position: "asc",
        },
        select: {
          id: true,
          title: true,
          position: true,
          lessons: {
            orderBy: {
              position: "asc",
            },
            select: {
              id: true,
              title: true,
              description: true,
              position: true,
            },
          },
        },
      },
    },
  });

  return curso;
}
