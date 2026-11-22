
"use server";

import { prisma } from "@/lib/db";
import { requireStudent } from "./require-student";
import { revalidatePath } from "next/cache";

export async function enrollCourse(courseId: string) {
  const session = await requireStudent();

  if (!courseId) {
    throw new Error("Curso inválido.");
  }

  const course = await prisma.course.findFirst({
    where: {
      id: courseId,
      status: "Published",
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (!course) {
    throw new Error("Curso não encontrado.");
  }

  const enrollment = await prisma.enrollment.upsert({
    where: {
      userId_courseId: {
        userId: session.user.id,
        courseId: course.id,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      courseId: course.id,
      amount: 0,
      status: "Active",
      updatedAt: new Date(),
    },
  });

  revalidatePath(`/courses/${course.slug}`);
  revalidatePath("/student");

  return enrollment;
}
