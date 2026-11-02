
import "server-only";
import { prisma } from "@/lib/db";

export async function getStudentCourse(courseId: string) {
  const curso = await prisma.course.findFirst({
    where: {
      id: courseId,
      status: "Published",
    },
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
              thumbnailKey: true,
              videoKey: true,
              position: true,
            },
          },
        },
      },
    },
  });

  return curso;
}
