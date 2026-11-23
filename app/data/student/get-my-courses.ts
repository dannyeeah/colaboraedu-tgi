
import "server-only";

import { prisma } from "@/lib/db";
import { requireStudent } from "./require-student";

export async function getMyCourses() {
  const session = await requireStudent();

  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: session.user.id,
      status: "Active",
    },
    include: {
      course: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return enrollments;
}
