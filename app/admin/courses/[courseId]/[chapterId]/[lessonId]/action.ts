"use server";

import { requireCourseOwner } from "@/app/data/admin/require-course-owner";
import { validateUploadOwnership } from "@/lib/upload-permissions";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { lessonSchema, LessonSchemaType } from "@/lib/zodSchemas";
import { revalidatePath } from "next/cache";

export async function updatedLesson(
  values: LessonSchemaType,
  lessonId: string,
): Promise<ApiResponse> {
  const result = lessonSchema.safeParse(values);

  if (!result.success) {
    return {
      status: "error",
      message: "Dados inválidos.",
    };
  }

  const { session, isSuperAdmin, course } =
    await requireCourseOwner(result.data.courseId);

  try {
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        chapterId: result.data.chapterId,
        Chapter: {
          courseId: course.id,
        },
      },
      select: {
        id: true,
        thumbnailKey: true,
        videoKey: true,
      },
    });

    if (!lesson) {
      return {
        status: "error",
        message: "Aula não encontrada neste curso ou capítulo.",
      };
    }

    await validateUploadOwnership({
      fileKey: result.data.thumbnailKey,
      currentFileKey: lesson.thumbnailKey,
      userId: session.user.id,
      isSuperAdmin,
      mediaType: "image",
    });

    await validateUploadOwnership({
      fileKey: result.data.videoKey,
      currentFileKey: lesson.videoKey,
      userId: session.user.id,
      isSuperAdmin,
      mediaType: "video",
    });

    const updatedLesson = await prisma.lesson.updateMany({
      where: {
        id: lesson.id,
        chapterId: result.data.chapterId,
        Chapter: {
          courseId: course.id,
          Course: {
            userId: course.userId,
          },
        },
      },
      data: {
        title: result.data.name,
        description: result.data.description ?? null,
        thumbnailKey: result.data.thumbnailKey || null,
        videoKey: result.data.videoKey || null,
      },
    });

    if (updatedLesson.count === 0) {
      return {
        status: "error",
        message: "Não foi possível localizar a aula.",
      };
    }

    revalidatePath(
      `/admin/courses/${course.id}/edit`,
    );

    revalidatePath(
      `/admin/courses/${course.id}/${result.data.chapterId}/${lessonId}`,
    );

    revalidatePath("/courses", "layout");

    return {
      status: "success",
      message: "Aula atualizada com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao atualizar aula:", error);

    return {
      status: "error",
      message: "Falha ao atualizar a aula. Verifique os arquivos e suas permissões.",
    };
  }
}