import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";
import { notFound } from "next/navigation";

export async function adminGetLesson(
  id: string,
  chapterId: string,
  courseId: string,
) {
  const session = await requireAdmin();

  const isSuperAdmin = session.user.role === "superadmin";

  const data = await prisma.lesson.findFirst({
    where: {
      id: id,
      chapterId: chapterId,
      Chapter: {
        courseId: courseId,
        ...(isSuperAdmin
          ? {}
          : {
              Course: {
                userId: session.user.id,
              },
            }),
      },
    },
    select: {
      title: true,
      videoKey: true,
      thumbnailKey: true,
      description: true,
      id: true,
      position: true,
    },
  });

  if (!data) {
    return notFound();
  }

  return data;
}

export type AdminLessonType = Awaited<
  ReturnType<typeof adminGetLesson>
>;