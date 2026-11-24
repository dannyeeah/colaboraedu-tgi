import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";
import { z } from "zod";

const utapi = new UTApi();

const deleteSchema = z.object({
  key: z.string().min(1).max(512),
});

export async function DELETE(request: Request) {
  const session = await requireAdmin();

  try {
    const body = await request.json();
    const validation = deleteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Chave de arquivo inválida." },
        { status: 400 }
      );
    }

    const { key } = validation.data;

    const isSuperAdmin =
      session.user.role === "superadmin";

    const upload = await prisma.uploader.findUnique({
      where: {
        fileKey: key,
      },
    });

    if (!upload) {
      return NextResponse.json(
        { error: "Arquivo sem registro de propriedade." },
        { status: 404 }
      );
    }

    if (
      !isSuperAdmin &&
      upload.userId !== session.user.id
    ) {
      return NextResponse.json(
        {
          error: "Você não possui permissão para excluir este arquivo.",
        },
        { status: 403 }
      );
    }

    const references = [
      key,
      upload.url,
      `https://utfs.io/f/${key}`,
    ];

    const [course, lesson] = await Promise.all([
      prisma.course.findFirst({
        where: {
          fileKey: {
            in: references,
          },
        },
        select: {
          id: true,
        },
      }),

      prisma.lesson.findFirst({
        where: {
          OR: [
            {
              videoKey: {
                in: references,
              },
            },
            {
              thumbnailKey: {
                in: references,
              },
            },
          ],
        },
        select: {
          id: true,
        },
      }),
    ]);

    if (course || lesson) {
      return NextResponse.json(
        {
          error: "Este arquivo está vinculado a um curso ou aula.",
        },
        { status: 409 }
      );
    }

    const result = await utapi.deleteFiles(key);

    if (!result.success) {
      return NextResponse.json(
        { error: "Não foi possível excluir o arquivo." },
        { status: 502 }
      );
    }

    await prisma.uploader.deleteMany({
      where: {
        fileKey: key,
      },
    });

    return NextResponse.json(
      { message: "Arquivo excluído com sucesso." },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: "Não foi possível excluir o arquivo." },
      { status: 500 }
    );
  }
}