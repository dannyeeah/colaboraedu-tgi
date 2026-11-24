import "server-only";

import { prisma } from "@/lib/db";
import { requireAdmin } from "./require-admin";

export async function adminGetCourses() {
  const session = await requireAdmin();

  const isSuperAdmin = session.user.role === "superadmin";

  const data = await prisma.course.findMany({
    where: isSuperAdmin
      ? {}
      : {
          userId: session.user.id,
        },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      smallDescription: true,
      duration: true,
      level: true,
      status: true,
      fileKey: true,
      slug: true,
      category: true,
    },
  });

  return data;
}

export type AdminCourseType = Awaited<
  ReturnType<typeof adminGetCourses>
>[0];