import * as z from "zod";

export const courseCategories = [
  "Health & Fitness",
  "Development",
  "Design",
  "Marketing",
  "Business",
  "Productivity",
];

export const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;

export const courseStatus = ["Draft", "Published", "Archived"] as const;

export const courseSchema = z.object({
  title: z.string().min(1, "Título é obrigatório."),
  description: z.string().min(1, "Descrição é obrigatória."),
  fileKey: z.string().min(1, "A imagem de capa é obrigatória."),
  duration: z.number().positive("A duração deve ser maior que zero."),
  level: z.enum(courseLevels),
  category: z.string().min(1, "Categoria é obrigatória."),
  status: z.enum(courseStatus),
  slug: z.string().min(1, "Slug é obrigatório."),
  smallDescription: z.string().min(1, "Resumo curto é obrigatório."),
});

export const chapterSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  courseId: z.string().min(1, "id do curso inválido"),
});

export const lessonSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  courseId: z.string().min(1, "id do curso inválido"),
  chapterId: z.string().min(1, "id do capítulo inválido"),
  description: z
    .string()
    .min(3, "A descrição deve ter pelo menos 3 caracteres")
    .optional(),
  thumbnailKey: z.string().optional(),
  videoKey: z.string().optional(),
});

export type CourseSchemaType = z.infer<typeof courseSchema>;
export type ChapterSchemaType = z.infer<typeof chapterSchema>;
export type LessonSchemaType = z.infer<typeof lessonSchema>;
