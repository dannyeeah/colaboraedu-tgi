"use client";

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
import {
  courseCategories,
  courseLevels,
  courseSchema,
  CourseSchemaType,
  courseStatus,
} from "@/lib/zodSchemas";
import { ArrowLeft, Loader2, PlusIcon, SparkleIcon } from "lucide-react";
import Link from "next/link";
import slugify from "slugify";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/rich-text-editor/Editor";
import { Uploader } from "@/components/file-uploader/Uploader";
import { useUploadThing } from "@/lib/uploadthing";
import { CreateCourse } from "./actions";
import { useRouter } from "next/navigation";
import { tryCatch } from "@/hooks/try-catch";
import { useConfetti } from "@/hooks/use-confetti";

export default function CourseCreationgPage() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { triggerConfetti } = useConfetti();

  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<
    "uploading" | "success" | "error" | undefined
  >();
  const [uploadProgress, setUploadProgress] = useState(0);
  const { startUpload } = useUploadThing("mediaUploader", {
    onUploadProgress: setUploadProgress,
    onUploadError: () => setUploadStatus("error"),
  });

  const form = useForm<CourseSchemaType>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      fileKey: "",
      duration: 0,
      level: "Beginner",
      category: "Health & Fitness",
      status: "Draft",
      slug: "",
      smallDescription: "",
    },
  });

  function onSubmit(values: CourseSchemaType) {
    startTransition(async () => {
      if (!pendingUploadFile) {
        toast.error("Selecione uma imagem de capa antes de criar o curso.");
        return;
      }

      setUploadStatus("uploading");

      const { data: uploadedFiles, error: uploadError } = await tryCatch(
        startUpload([pendingUploadFile]),
      );

      if (uploadError || !uploadedFiles?.[0]?.key) {
        setUploadStatus("error");
        toast.error("Não foi possível enviar a imagem. Tente novamente.");
        return;
      }

      form.setValue("fileKey", uploadedFiles[0].key, {
        shouldValidate: true,
      });

      const { data: result, error } = await tryCatch(
        CreateCourse({
          ...values,
          fileKey: uploadedFiles[0].key,
        }),
      );

      if (error) {
        toast.error("An unexpected error ocurred. Please try again");
        return;
      }

      if (!result) {
        toast.error("Um erro inesperado aconteceu. Por favor, tente novamente");
        return;
      }

      if (result.status === "success") {
        setUploadStatus("success");
        toast.success(result.message);
        triggerConfetti();
        form.reset();
        router.push("/admin/courses");
      } else if (result.status === "error") {
        toast.error(result.message);
      }
    });
  }

  function onInvalid(errors: FieldErrors<CourseSchemaType>) {
    if (errors.fileKey) {
      toast.error("A imagem de capa é obrigatória.", { duration: 4000 });
    }

    if (errors.duration) {
      toast.error("A duração deve ser maior que zero.", { duration: 4000 });
    }
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <Link
          href="/admin/courses"
          className={buttonVariants({
            variant: "outline",
            size: "icon",
          })}
        >
          <ArrowLeft className="size-4" />
        </Link>
        <h1 className="text-2xl font-bold">Criar Cursos</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informações básicas</CardTitle>
          <CardDescription>
            Fornecer Informações básicas sobre os cursos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          >
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Título</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                    placeholder="Ex: Introdução ao Next.js"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="flex gap-4 items-end">
              <Controller
                name="slug"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Slug (URL)</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                      placeholder="introducao-ao-nextjs"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Button
                type="button"
                className="w-fit"
                onClick={() => {
                  const titleValue = form.getValues("title");

                  if (!titleValue?.trim()) return;

                  const slug = slugify(titleValue, {
                    lower: true,
                    strict: true,
                    trim: true,
                  });

                  form.setValue("slug", slug, { shouldValidate: true });
                }}
              >
                Gerar Slug <SparkleIcon className="ml-1" size={16} />
              </Button>
            </div>

            <Controller
              name="smallDescription"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Resumo curto</FieldLabel>
                  <Textarea
                    {...field}
                    placeholder="Uma frase que resuma o curso (aparece nos cards)"
                    className="min-h-30"
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
              name="fileKey"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Imagem de capa</FieldLabel>
                  <Uploader
                    fileKey={
                      field.value === "pending-upload" ? undefined : field.value
                    }
                    onFileSelected={(file) => {
                      setPendingUploadFile(file);
                      if (!file) {
                        form.setValue("fileKey", "", {
                          shouldValidate: true,
                        });
                        setUploadStatus(undefined);
                        setUploadProgress(0);
                      } else {
                        form.setValue("fileKey", "pending-upload", {
                          shouldValidate: true,
                        });
                        form.clearErrors("fileKey");
                      }
                    }}
                    status={uploadStatus}
                    progress={uploadProgress}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Controller
                name="category"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Categoria</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="level"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Nivel</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseLevels.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="duration"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Duração (horas)
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      value={field.value === 0 ? "" : (field.value ?? "")}
                      onChange={(event) => {
                        const value = event.target.value;
                        field.onChange(value === "" ? 0 : Number(value));
                      }}
                      aria-invalid={fieldState.invalid}
                      placeholder="Ex: 10"
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="status"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Status</FieldLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        {courseStatus.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  Criando...
                  <Loader2 className="animate-spin ml-1" />
                </>
              ) : (
                <>
                  Criar curso <PlusIcon className="ml-1" size={16} />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
