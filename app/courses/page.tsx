import Link from "next/link";
import { BookOpen, GraduationCap } from "lucide-react";
import { getStudentCourses } from "@/app/data/student/get-courses";

export default async function CoursesPage() {
  const cursos = await getStudentCourses();

  return (
    <main className="min-h-screen bg-background px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">
            Explorar cursos
          </h1>

          <p className="mt-2 text-muted-foreground">
            Encontre um curso e comece a aprender com o ColaboraEdu.
          </p>
        </div>

        {cursos.length === 0 ? (
          <div className="rounded-xl border p-8 text-center">
            <BookOpen className="mx-auto mb-4" size={36} />

            <h2 className="text-lg font-semibold">
              Nenhum curso disponível
            </h2>

            <p className="mt-2 text-muted-foreground">
              Ainda não existem cursos publicados.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cursos.map((curso) => (
              <div
                key={curso.id}
                className="rounded-xl border bg-card p-6 shadow-sm"
              >
                <GraduationCap
                  size={32}
                  className="mb-4 text-primary"
                />

                <h2 className="text-xl font-semibold">
                  {curso.title}
                </h2>

                <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">
                  {curso.smallDescription ||
                    "Curso disponível para aprendizagem."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{curso.level}</span>
                  <span>•</span>
                  <span>{curso.category}</span>
                </div>

                <Link
                  href={`/courses/${curso.id}`}
                  className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                >
                  Ver curso
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}