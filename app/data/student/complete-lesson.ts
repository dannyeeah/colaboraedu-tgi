
"use server";

import { prisma } from "@/lib/db";
import { requireStudent } from "./require-student";
import { revalidatePath } from "next/cache";

export async function completeLesson(lessonId: string) {
  const session = await requireStudent();

  if (!lessonId) {
    throw new Error("Aula inválida.");
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
              slug: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!lesson || lesson.Chapter.Course.status !== "Published") {
    throw new Error("Aula não encontrada.");
  }

  const course = lesson.Chapter.Course;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: course.id,
      },
    },
  });

  if (!enrollment || enrollment.status !== "Active") {
    throw new Error(
      "Você precisa estar matriculado neste curso para concluir aulas."
    );
  }

  await prisma.lessonProgress.upsert({
    where: {
      userId_lessonId: {
        userId: session.user.id,
        lessonId,
      },
    },
    update: {
      completed: true,
      completedAt: new Date(),
    },
    create: {
      userId: session.user.id,
      lessonId,
      completed: true,
      completedAt: new Date(),
    },
  });

  revalidatePath(`/courses/${course.slug}/lessons/${lessonId}`);
  revalidatePath("/student");
}
