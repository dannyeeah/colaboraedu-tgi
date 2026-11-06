import "server-only";
import { prisma } from "@/lib/db";

export async function getStudentCourses() {
  return prisma.course.findMany({
    where: {
      status: "Published",
    },
    select: {
      id: true,
      title: true,
      smallDescription: true,
      level: true,
      category: true,
    },
    orderBy: {
      title: "asc",
    },
  });
}