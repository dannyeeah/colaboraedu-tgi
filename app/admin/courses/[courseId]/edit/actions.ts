"use server";

import { requireCourseOwner } from "@/app/data/admin/require-course-owner";
import { validateUploadOwnership } from "@/lib/upload-permissions";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import {
  chapterSchema,
  ChapterSchemaType,
  courseSchema,
  CourseSchemaType,
  lessonSchema,
  LessonSchemaType,
} from "@/lib/zodSchemas";
import { revalidatePath } from "next/cache";
import { updatedLesson } from "../[chapterId]/[lessonId]/action";

// ======================================================
// 1. EDITAR CURSO
// ======================================================

export async function editCourse(
  data: CourseSchemaType,
  courseId: string,
): Promise<ApiResponse> {
  const { session, course, isSuperAdmin } =
    await requireCourseOwner(courseId);

  try {
    const result = courseSchema.safeParse(data);

    if (!result.success) {
      return {
        status: "error",
        message: "Dados inválidos.",
      };
    }

    const currentCourse = await prisma.course.findUnique({
      where: {
        id: course.id,
        userId: course.userId,
      },
      select: {
        fileKey: true,
      },
    });

    if (!currentCourse) {
      return {
        status: "error",
        message: "Curso não encontrado.",
      };
    }

    if (!result.data.fileKey?.trim()) {
      return {
        status: "error",
        message: "Selecione uma imagem de capa.",
      };
    }

    await validateUploadOwnership({
      fileKey: result.data.fileKey,
      currentFileKey: currentCourse.fileKey,
      userId: session.user.id,
      isSuperAdmin,
      mediaType: "image",
    });

    await prisma.course.update({
      where: {
        id: course.id,
        userId: course.userId,
      },
      data: {
        ...result.data,
        userId: course.userId,
      },
    });

    revalidatePath("/admin/courses");
    revalidatePath(`/admin/courses/${courseId}/edit`);
    revalidatePath("/courses", "layout");

    return {
      status: "success",
      message: "Curso atualizado com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao editar curso:", error);

    return {
      status: "error",
      message:
        "Falha ao atualizar o curso. Verifique os arquivos e suas permissões.",
    };
  }
}

// ======================================================
// 2. REORDENAR AULAS
// ======================================================

export async function reorderLessons(
  chapterId: string,
  lessons: { id: string; position: number }[],
  courseId: string,
): Promise<ApiResponse> {
  await requireCourseOwner(courseId);

  try {
    if (!lessons || lessons.length === 0) {
      return {
        status: "error",
        message: "Nenhuma aula informada para reordenação.",
      };
    }

    const chapter = await prisma.chapter.findFirst({
      where: {
        id: chapterId,
        courseId,
      },
      select: {
        id: true,
      },
    });

    if (!chapter) {
      return {
        status: "error",
        message: "Capítulo não encontrado neste curso.",
      };
    }

    const updates = lessons.map((lesson) =>
      prisma.lesson.update({
        where: {
          id: lesson.id,
          chapterId: chapter.id,
        },
        data: {
          position: lesson.position,
        },
      }),
    );

    await prisma.$transaction(updates);

    revalidatePath(`/admin/courses/${courseId}/edit`);
    revalidatePath("/courses", "layout");

    return {
      status: "success",
      message: "Aulas reordenadas com sucesso.",
    };
  } catch {
    return {
      status: "error",
      message: "Falha ao reordenar as aulas.",
    };
  }
}

// ======================================================
// 3. REORDENAR CAPÍTULOS
// ======================================================

export async function reorderChapter(
  courseId: string,
  chapters: { id: string; position: number }[],
): Promise<ApiResponse> {
  await requireCourseOwner(courseId);

  try {
    if (!chapters || chapters.length === 0) {
      return {
        status: "error",
        message: "Nenhum capítulo informado para reordenação.",
      };
    }

    const updates = chapters.map((chapter) =>
      prisma.chapter.update({
        where: {
          id: chapter.id,
          courseId,
        },
        data: {
          position: chapter.position,
        },
      }),
    );

    await prisma.$transaction(updates);

    revalidatePath(`/admin/courses/${courseId}/edit`);
    revalidatePath("/courses", "layout");

    return {
      status: "success",
      message: "Capítulos reordenados com sucesso.",
    };
  } catch {
    return {
      status: "error",
      message: "Falha ao reordenar os capítulos.",
    };
  }
}

// ======================================================
// 4. CRIAR CAPÍTULO
// ======================================================

export async function createChapter(
  values: ChapterSchemaType,
): Promise<ApiResponse> {
  const result = chapterSchema.safeParse(values);

  if (!result.success) {
    return {
      status: "error",
      message: "Dados inválidos.",
    };
  }

  await requireCourseOwner(result.data.courseId);

  try {
    await prisma.$transaction(async (tx) => {
      const maxPos = await tx.chapter.findFirst({
        where: {
          courseId: result.data.courseId,
        },
        select: {
          position: true,
        },
        orderBy: {
          position: "desc",
        },
      });

      await tx.chapter.create({
        data: {
          title: result.data.name,
          courseId: result.data.courseId,
          position: (maxPos?.position ?? 0) + 1,
        },
      });
    });

    revalidatePath(
      `/admin/courses/${result.data.courseId}/edit`,
    );

    revalidatePath("/courses", "layout");

    return {
      status: "success",
      message: "Capítulo criado com sucesso.",
    };
  } catch {
    return {
      status: "error",
      message: "Falha ao criar o capítulo.",
    };
  }
}

// ======================================================
// 5. CRIAR AULA
// ======================================================

export async function createLesson(
  values: ChapterSchemaType,
): Promise<ApiResponse> {
  const result = lessonSchema.safeParse(values);

  if (!result.success) {
    return {
      status: "error",
      message: "Dados inválidos.",
    };
  }

  const { session, course, isSuperAdmin } =
    await requireCourseOwner(result.data.courseId);

  try {
    const chapter = await prisma.chapter.findFirst({
      where: {
        id: result.data.chapterId,
        courseId: course.id,
      },
      select: {
        id: true,
      },
    });

    if (!chapter) {
      return {
        status: "error",
        message: "Capítulo não encontrado neste curso.",
      };
    }

    await validateUploadOwnership({
      fileKey: result.data.thumbnailKey,
      userId: session.user.id,
      isSuperAdmin,
      mediaType: "image",
    });

    await validateUploadOwnership({
      fileKey: result.data.videoKey,
      userId: session.user.id,
      isSuperAdmin,
      mediaType: "video",
    });

    await prisma.$transaction(async (tx) => {
      const maxPos = await tx.lesson.findFirst({
        where: {
          chapterId: chapter.id,
        },
        select: {
          position: true,
        },
        orderBy: {
          position: "desc",
        },
      });

      await tx.lesson.create({
        data: {
          title: result.data.name,
          description: result.data.description ?? null,
          videoKey: result.data.videoKey || null,
          thumbnailKey: result.data.thumbnailKey || null,
          chapterId: chapter.id,
          position: (maxPos?.position ?? 0) + 1,
        },
      });
    });

    revalidatePath(
      `/admin/courses/${course.id}/edit`,
    );

    revalidatePath("/courses", "layout");

    return {
      status: "success",
      message: "Aula criada com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao criar aula:", error);

    return {
      status: "error",
      message:
        "Falha ao criar a aula. Verifique os arquivos e suas permissões.",
    };
  }
}

// ======================================================
// 6. ATUALIZAR AULA
// ======================================================

export async function updateLesson(
  lessonId: string,
  values: LessonSchemaType,
): Promise<ApiResponse> {
  return updatedLesson(values, lessonId);
}

// ======================================================
// 7. EXCLUIR AULA
// ======================================================

export async function deleteLesson({
  chapterId,
  courseId,
  lessonId,
}: {
  chapterId: string;
  courseId: string;
  lessonId: string;
}): Promise<ApiResponse> {
  await requireCourseOwner(courseId);

  try {
    const chapterWithLessons = await prisma.chapter.findFirst({
      where: {
        id: chapterId,
        courseId,
      },
      select: {
        lessons: {
          orderBy: {
            position: "asc",
          },
          select: {
            id: true,
            position: true,
          },
        },
      },
    });

    if (!chapterWithLessons) {
      return {
        status: "error",
        message: "Capítulo não encontrado neste curso.",
      };
    }

    const lessons = chapterWithLessons.lessons;

    const lessonToDelete = lessons.find(
      (lesson) => lesson.id === lessonId,
    );

    if (!lessonToDelete) {
      return {
        status: "error",
        message: "Aula não encontrada neste capítulo.",
      };
    }

    const remainingLessons = lessons.filter(
      (lesson) => lesson.id !== lessonId,
    );

    const updates = remainingLessons.map((lesson, index) =>
      prisma.lesson.update({
        where: {
          id: lesson.id,
          chapterId,
        },
        data: {
          position: index + 1,
        },
      }),
    );

    await prisma.$transaction([
      ...updates,
      prisma.lesson.delete({
        where: {
          id: lessonId,
          chapterId,
        },
      }),
    ]);

    revalidatePath(`/admin/courses/${courseId}/edit`);
    revalidatePath("/courses", "layout");
    revalidatePath("/student");

    return {
      status: "success",
      message:
        "Aula excluída e posições reorganizadas com sucesso.",
    };
  } catch {
    return {
      status: "error",
      message: "Falha ao excluir a aula.",
    };
  }
}

// ======================================================
// 8. EXCLUIR CAPÍTULO
// ======================================================

export async function deleteChapter({
  chapterId,
  courseId,
}: {
  chapterId: string;
  courseId: string;
}): Promise<ApiResponse> {
  await requireCourseOwner(courseId);

  try {
    const courseWithChapters = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
      select: {
        chapter: {
          orderBy: {
            position: "asc",
          },
          select: {
            id: true,
            position: true,
          },
        },
      },
    });

    if (!courseWithChapters) {
      return {
        status: "error",
        message: "Curso não encontrado.",
      };
    }

    const chapters = courseWithChapters.chapter;

    const chapterToDelete = chapters.find(
      (chapter) => chapter.id === chapterId,
    );

    if (!chapterToDelete) {
      return {
        status: "error",
        message: "Capítulo não encontrado neste curso.",
      };
    }

    const remainingChapters = chapters.filter(
      (chapter) => chapter.id !== chapterId,
    );

    const updates = remainingChapters.map((chapter, index) =>
      prisma.chapter.update({
        where: {
          id: chapter.id,
          courseId,
        },
        data: {
          position: index + 1,
        },
      }),
    );

    await prisma.$transaction([
      ...updates,
      prisma.chapter.delete({
        where: {
          id: chapterId,
          courseId,
        },
      }),
    ]);

    revalidatePath(`/admin/courses/${courseId}/edit`);
    revalidatePath("/courses", "layout");
    revalidatePath("/student");

    return {
      status: "success",
      message:
        "Capítulo excluído e posições reorganizadas com sucesso.",
    };
  } catch {
    return {
      status: "error",
      message: "Falha ao excluir o capítulo.",
    };
  }
}