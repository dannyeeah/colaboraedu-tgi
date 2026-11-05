import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  mediaUploader: f({
    image: { maxFileSize: "4MB", maxFileCount: 1 },
    video: { maxFileSize: "512MB", maxFileCount: 1 },
  }).onUploadComplete(async ({ file }) => {
    return {
      key: file.key,
      url: file.url,
      name: file.name,
      type: file.type,
      size: file.size,
    };
  }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
