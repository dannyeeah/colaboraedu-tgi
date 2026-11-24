"use server";

import { requireCourseOwner } from "@/app/data/admin/require-course-owner";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function deleteCourse(
  courseId: string,
): Promise<ApiResponse> {
  const { course } = await requireCourseOwner(courseId);

  try {
    await prisma.course.delete({
      where: {
        id: course.id,
        userId: course.userId,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath("/courses");

    return {
      status: "success",
      message: "Curso excluído com sucesso.",
    };
  } catch {
    return {
      status: "error",
      message: "Falha ao excluir o curso.",
    };
  }
}