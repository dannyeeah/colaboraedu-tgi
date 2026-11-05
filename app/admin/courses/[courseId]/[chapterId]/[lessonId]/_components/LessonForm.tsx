"use client";

import { AdminLessonType } from "@/app/data/admin/admin-get-lesson";
import { Uploader } from "@/components/file-uploader/Uploader";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { lessonSchema, LessonSchemaType } from "@/lib/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { tryCatch } from "@/hooks/try-catch";
import { useUploadThing } from "@/lib/uploadthing";
import { updatedLesson } from "../action";

const pendingUploadKey = "pending-upload";

interface iAppProps {
  data: AdminLessonType;
  chapterId: string;
  courseId: string;
}

export function LessonForm({ chapterId, data, courseId }: iAppProps) {
  const [pending, startTransition] = useTransition();
  const [pendingFiles, setPendingFiles] = useState<{
    thumbnail: File | null;
    video: File | null;
  }>({ thumbnail: null, video: null });
  const [activeUpload, setActiveUpload] = useState<
    "thumbnailKey" | "videoKey" | null
  >(null);
  const [uploadError, setUploadError] = useState<
    "thumbnailKey" | "videoKey" | null
  >(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const router = useRouter();
  const { startUpload } = useUploadThing("mediaUploader", {
    onUploadProgress: setUploadProgress,
  });

  const form = useForm<LessonSchemaType>({
    resolver: zodResolver(lessonSchema),
    defaultValues: {
      name: data.title,
      chapterId: chapterId,
      courseId: courseId,
      description: data.description ?? undefined,
      videoKey: data.videoKey ?? undefined,
      thumbnailKey: data.thumbnailKey ?? undefined,
    },
  });

  function onSubmit(values: LessonSchemaType) {
    startTransition(async () => {
      let thumbnailKey =
        values.thumbnailKey === pendingUploadKey
          ? undefined
          : values.thumbnailKey;
      let videoKey =
        values.videoKey === pendingUploadKey ? undefined : values.videoKey;

      if (pendingFiles.thumbnail) {
        setActiveUpload("thumbnailKey");
        setUploadProgress(0);

        const { data: uploaded, error } = await tryCatch(
          startUpload([pendingFiles.thumbnail]),
        );

        setActiveUpload(null);

        if (error || !uploaded?.[0]?.key) {
          setUploadError("thumbnailKey");
          toast.error("Não foi possível enviar a imagem. Tente novamente.");
          return;
        }

        thumbnailKey = uploaded[0].key;
        form.setValue("thumbnailKey", thumbnailKey, { shouldDirty: true });
        setPendingFiles((files) => ({ ...files, thumbnail: null }));
        setUploadError(null);
      }

      if (pendingFiles.video) {
        setActiveUpload("videoKey");
        setUploadProgress(0);

        const { data: uploaded, error } = await tryCatch(
          startUpload([pendingFiles.video]),
        );

        setActiveUpload(null);

        if (error || !uploaded?.[0]?.key) {
          setUploadError("videoKey");
          toast.error("Não foi possível enviar o vídeo. Tente novamente.");
          return;
        }

        videoKey = uploaded[0].key;
        form.setValue("videoKey", videoKey, { shouldDirty: true });
        setPendingFiles((files) => ({ ...files, video: null }));
        setUploadError(null);
      }

      const { data: result, error } = await tryCatch(
        updatedLesson(
          {
            ...values,
            thumbnailKey,
            videoKey,
          },
          data.id,
        ),
      );

      if (error) {
        toast.error("Ocorreu um erro inesperado. Tente novamente.");
        return;
      }

      if (result.status === "success") {
        toast.success("Lição atualizada com sucesso.");
        router.push(`/admin/courses/${courseId}/edit`);
      } else {
        toast.error(result.message);
      }
    });
  }

  function handleFileSelected(
    fieldName: "thumbnailKey" | "videoKey",
    file: File | null,
  ) {
    const fileType = fieldName === "thumbnailKey" ? "thumbnail" : "video";

    setPendingFiles((files) => ({ ...files, [fileType]: file }));
    setUploadError(null);
    form.setValue(fieldName, file ? pendingUploadKey : undefined, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  return (
    <div>
      <Link
        className={buttonVariants({ variant: "outline", className: "mb-6" })}
        href={`/admin/courses/${courseId}/edit`}
      >
        <ArrowLeft className="size-4" />

        <span>Voltar</span>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Configuração da lição</CardTitle>
          <CardDescription>
            Configure o vídeo e a descrição desta aula
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Nome</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Nome da lição"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Descrição</FieldLabel>
                  <RichTextEditor field={field} />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="thumbnailKey"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Thumbnail Imagem</FieldLabel>
                  <Uploader
                    mediaType="image"
                    fileKey={
                      field.value === pendingUploadKey ? undefined : field.value
                    }
                    onFileSelected={(file) =>
                      handleFileSelected("thumbnailKey", file)
                    }
                    status={
                      activeUpload === "thumbnailKey"
                        ? "uploading"
                        : uploadError === "thumbnailKey"
                          ? "error"
                          : undefined
                    }
                    progress={uploadProgress}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="videoKey"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Arquivo de vídeo</FieldLabel>
                  <Uploader
                    mediaType="video"
                    fileKey={
                      field.value === pendingUploadKey ? undefined : field.value
                    }
                    onFileSelected={(file) =>
                      handleFileSelected("videoKey", file)
                    }
                    status={
                      activeUpload === "videoKey"
                        ? "uploading"
                        : uploadError === "videoKey"
                          ? "error"
                          : undefined
                    }
                    progress={uploadProgress}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  Salvando...
                  <Loader2 className="ml-1 size-4 animate-spin" />
                </>
              ) : (
                "Salvar lição"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
