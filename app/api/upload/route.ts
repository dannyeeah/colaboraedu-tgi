import { requireAdmin } from "@/app/data/admin/require-admin";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

export const fileUploadSchema = z.object({
  fileName: z.string().min(1, "O nome do arquivo é obrigatório"),
  contentType: z.string().min(1, "O tipo de conteúdo é obrigatório"),
  size: z.number().min(1, "Tamanho é obrigatório"),
  isImage: z.boolean(),
  url: z.string().url("A URL do arquivo é inválida"),
});

export async function POST(request: Request) {
  await requireAdmin();

  try {
    const body = await request.json();

    const validation = fileUploadSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Conteúdo da solicitação inválido" },
        { status: 400 },
      );
    }

    const { fileName, contentType, size, url } = validation.data;

    const upload = await prisma.uploader.create({
      data: {
        name: fileName,
        url,
        fileType: contentType,
        fileSize: size,
      },
    });

    return NextResponse.json(upload, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível processar o upload" },
      { status: 500 },
    );
  }
}
