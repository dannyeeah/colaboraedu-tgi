import {
  createUploadthing,
  type FileRouter,
} from "uploadthing/next";

import { UploadThingError } from "uploadthing/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
    video: {
      maxFileSize: "512MB",
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      const session = await auth.api.getSession({
        headers: req.headers,
      });

      if (!session) {
        throw new UploadThingError(
          "Você precisa estar autenticado."
        );
      }

      const user = await prisma.user.findUnique({
        where: {
          id: session.user.id,
        },
        select: {
          id: true,
          role: true,
          banned: true,
        },
      });

      if (!user || user.banned) {
        throw new UploadThingError(
          "Usuário sem permissão de acesso."
        );
      }

      if (
        user.role !== "admin" &&
        user.role !== "superadmin"
      ) {
        throw new UploadThingError(
          "Você não possui permissão para enviar arquivos."
        );
      }

      return {
        userId: user.id,
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      await prisma.uploader.upsert({
        where: {
          fileKey: file.key,
        },
        update: {},
        create: {
          name: file.name,
          url: file.url,
          fileType: file.type,
          fileSize: file.size,
          fileKey: file.key,
          userId: metadata.userId,
        },
      });

      return {
        key: file.key,
        url: file.url,
        name: file.name,
        type: file.type,
        size: file.size,
        userId: metadata.userId,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;