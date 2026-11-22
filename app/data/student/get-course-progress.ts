
import "server-only";

import { prisma } from "@/lib/db";
import { requireStudent } from "./require-student";

export async function getCourseProgress(courseId: string) {
  const session = await requireStudent();

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
    return {
      totalLessons: 0,
      completedLessons: 0,
      percentage: 0,
    };
  }

  const totalLessons = await prisma.lesson.count({
    where: {
      Chapter: {
        courseId,
      },
    },
  });

  const completedLessons = await prisma.lessonProgress.count({
    where: {
      userId: session.user.id,
      completed: true,
      lesson: {
        Chapter: {
          courseId,
        },
      },
    },
  });

  const percentage =
    totalLessons > 0
      ? Math.round((completedLessons / totalLessons) * 100)
      : 0;

  return {
    totalLessons,
    completedLessons,
    percentage,
  };
}
