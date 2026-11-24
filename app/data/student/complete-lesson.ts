
"use server";
import { unlockAchievements } from "@/lib/achievements";
import { prisma } from "@/lib/db";
import { requireStudent } from "./require-student";
import { revalidatePath } from "next/cache";

export async function completeLesson(lessonId: string) {
  const session = await requireStudent();

  if (!lessonId) {
    throw new Error("Aula inválida.");
  }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
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
  const userId = session.user.id;

  const enrollment = await prisma.enrollment.findUnique({
    where: {
      userId_courseId: {
        userId,
        courseId: course.id,
      },
    },
  });

  if (!enrollment || enrollment.status !== "Active") {
    throw new Error(
      "Você precisa estar matriculado neste curso para concluir aulas."
    );
  }

  await prisma.$transaction(async (tx) => {
    // 1. Registrar a conclusão da aula
    await tx.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId,
        },
      },
      update: {
        completed: true,
      },
      create: {
        userId,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
    });

    // 2. Conceder 10 XP pela aula (somente uma vez)
    await tx.xpTransaction.createMany({
      data: [
        {
          id: crypto.randomUUID(),
          userId,
          amount: 10,
          reason: "LESSON_COMPLETED",
          reference: `lesson:${userId}:${lessonId}`,
        },
      ],
      skipDuplicates: true,
    });

    // 3. Contar todas as aulas do curso
    const totalLessons = await tx.lesson.count({
      where: {
        Chapter: {
          courseId: course.id,
        },
      },
    });

    // 4. Contar as aulas concluídas pelo estudante
    const completedLessons = await tx.lessonProgress.count({
      where: {
        userId,
        completed: true,
        lesson: {
          Chapter: {
            courseId: course.id,
          },
        },
      },
    });

    // 5. Conceder 100 XP ao concluir 100% do curso
    if (totalLessons > 0 && completedLessons === totalLessons) {
      await tx.xpTransaction.createMany({
        data: [
          {
            id: crypto.randomUUID(),
            userId,
            amount: 100,
            reason: "COURSE_COMPLETED",
            reference: `course:${userId}:${course.id}`,
          },
        ],
        skipDuplicates: true,
      });
    }
  });

    // 6. Verificar e desbloquear conquistas
  await unlockAchievements(userId);

  // 7. Atualizar as páginas
  revalidatePath(`/courses/${course.slug}/lessons/${lessonId}`);
  revalidatePath("/student");
}
