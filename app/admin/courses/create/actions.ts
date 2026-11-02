"use server";

import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { courseSchema, CourseSchemaType } from "@/lib/zodSchemas";

export async function CreateCourse(
  data: CourseSchemaType,
): Promise<ApiResponse> {
  const session = await requireAdmin();
  try {
    // if (!session || session.user.role !== "admin") {
    //   return {
    //     status: "error",
    //     message: "Usuário não autorizado",
    //   };
    // }

    // Temporariamente liberado para testes. Reative a validação de admin depois.
    // if (session.user.role !== "admin") {
    //   return {
    //     status: "error",
    //     message: "Usuário não autorizado",
    //   };
    // }

    const validation = courseSchema.safeParse(data);

    if (!validation.success) {
      return {
        status: "error",
        message: "Dados inválidos",
      };
    }

    await prisma.course.create({
      data: {
        ...validation.data,
        userId: session?.user.id as string,
      },
    });

    return {
      status: "success",
      message: "Course created succesfully",
    };
  } catch (error) {
    console.log(error);
    return {
      status: "error",
      message:
        "Não foi possível criar o curso. Verifique os dados e tente novamente.",
    };
  }
}
