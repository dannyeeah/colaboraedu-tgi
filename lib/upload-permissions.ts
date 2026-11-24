import "server-only";

import { prisma } from "@/lib/db";

interface ValidateUploadParams {
  fileKey?: string | null;
  currentFileKey?: string | null;
  userId: string;
  isSuperAdmin: boolean;
  mediaType: "image" | "video";
}

export async function validateUploadOwnership({
  fileKey,
  currentFileKey,
  userId,
  isSuperAdmin,
  mediaType,
}: ValidateUploadParams): Promise<void> {
  if (!fileKey) {
    return;
  }

  if (fileKey === "pending-upload") {
    throw new Error("O envio do arquivo ainda não foi concluído.");
  }

  // Preserva arquivos existentes que não foram alterados.
  if (fileKey === currentFileKey) {
    return;
  }

  const upload = await prisma.uploader.findUnique({
    where: {
      fileKey,
    },
    select: {
      userId: true,
      fileType: true,
    },
  });

  if (!upload) {
    throw new Error(
      "Arquivo não encontrado ou sem registro de propriedade."
    );
  }

  if (!isSuperAdmin && upload.userId !== userId) {
    throw new Error(
      "Você não possui permissão para utilizar este arquivo."
    );
  }

  if (!upload.fileType.startsWith(`${mediaType}/`)) {
    throw new Error(
      "O tipo do arquivo é incompatível com este campo."
    );
  }
}