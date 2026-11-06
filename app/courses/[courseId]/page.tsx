import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, PlayCircle } from "lucide-react";
import { getStudentCourse } from "@/app/data/student/get-course";

type PageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseDetailsPage({
  params,
}: PageProps) {
  const { courseId } = await params;

  const curso = await getStudentCourse(courseId);

  if (!curso) {
    notFound();
  }

  const totalAulas = curso.chapter.reduce(
    (total, capitulo) => total + capitulo.lessons.length,
    0
  );

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/courses"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Voltar para cursos
        </Link>

        <div className="mt-8">
          <h1 className="text-3xl font-bold">{curso.title}</h1>

          <p className="mt-4 text-muted-foreground">
            {curso.smallDescription ||
              "Conheça o conteúdo deste curso."}
          </p>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>{curso.level}</span>
            <span>{curso.category}</span>
            <span>{totalAulas} aulas</span>
          </div>
        </div>

        <div className="mt-10 space-y-6">
          <h2 className="text-2xl font-semibold">
            Conteúdo do curso
          </h2>

          {curso.chapter.length === 0 ? (
            <p className="text-muted-foreground">
              Este curso ainda não possui capítulos.
            </p>
          ) : (
            curso.chapter.map((capitulo) => (
              <section
                key={capitulo.id}
                className="rounded-xl border bg-card p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <BookOpen size={22} className="text-primary" />

                  <h3 className="text-lg font-semibold">
                    {capitulo.title}
                  </h3>
                </div>

                {capitulo.lessons.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhuma aula cadastrada neste capítulo.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {capitulo.lessons.map((aula) => (
                      <Link
                        key={aula.id}
                        href={`/courses/${curso.id}/lessons/${aula.id}`}
                        className="flex items-center gap-3 rounded-lg border p-4 transition hover:bg-accent"
                      >
                        <PlayCircle
                          size={20}
                          className="text-primary"
                        />

                        <span className="font-medium">
                          {aula.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </section>
            ))
          )}
        </div>
      </div>
    </main>
  );
}