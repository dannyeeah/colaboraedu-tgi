import { CourseFilters } from "./_components/course-filters";
import Link from "next/link";
import { requireStudent } from "@/app/data/student/require-student";
import { getMyCourses } from "@/app/data/student/get-my-courses";
import { getCourseProgress } from "@/app/data/student/get-course-progress";
import { getNextLesson } from "@/app/data/student/get-next-lesson";
export default async function StudentPage() {
  const session = await requireStudent();
  const enrollments = await getMyCourses();

  const nome = session.user.name || "Estudante";

  
  const coursesWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {
      const [progress, nextLessonId] = await Promise.all([
        getCourseProgress(enrollment.courseId),
        getNextLesson(enrollment.courseId),
      ]);

      return {
        ...enrollment,
        progress,
        nextLessonId,
      };
    })
  );

  // Estatísticas do estudante
  const totalCursos = coursesWithProgress.length;

  const cursosConcluidos = coursesWithProgress.filter(
    (item) =>
      item.progress.totalLessons > 0 &&
      item.progress.percentage === 100
  ).length;

  const cursosEmAndamento = coursesWithProgress.filter(
    (item) =>
      item.progress.totalLessons > 0 &&
      item.progress.percentage > 0 &&
      item.progress.percentage < 100
  ).length;

  const progressoMedio =
    totalCursos > 0
      ? Math.round(
          coursesWithProgress.reduce(
            (total, item) => total + item.progress.percentage,
            0
          ) / totalCursos
        )
      : 0;

  
  // Seleciona um curso para continuar estudando
  const cursoParaContinuar = coursesWithProgress.find(
    (item) =>
      item.nextLessonId &&
      item.progress.totalLessons > 0 &&
      item.progress.percentage < 100
  );

return (
  <main className="container mx-auto px-6 py-10">

    <div className="mb-8 flex flex-wrap gap-3">
      <Link
        href="/"
        className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        ← Página Inicial
      </Link>

      <Link
        href="/courses"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Explorar Cursos
      </Link>
    </div>

    <h1 className="text-3xl font-bold">
      Olá, {nome}! 👋
    </h1>


      <p className="mt-3 text-muted-foreground">
        Bem-vindo ao seu espaço de aprendizagem no ColaboraEdu.
      </p>

{cursoParaContinuar && (
  <section className="mt-8 rounded-xl border bg-card p-6 shadow-sm">
    <h2 className="text-2xl font-semibold">
      Continuar Aprendendo
    </h2>

    <p className="mt-2 text-muted-foreground">
      Continue sua jornada de aprendizagem de onde parou.
    </p>

    <div className="mt-6 rounded-xl border p-5">
      <h3 className="text-xl font-semibold">
        {cursoParaContinuar.course.title}
      </h3>

      <div className="mt-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Seu progresso
          </span>

          <span className="font-semibold">
            {cursoParaContinuar.progress.percentage}%
          </span>
        </div>

        <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{
              width: `${cursoParaContinuar.progress.percentage}%`,
            }}
          />
        </div>
      </div>

      <Link
        href={`/courses/${cursoParaContinuar.course.slug}/lessons/${cursoParaContinuar.nextLessonId}`}
        className="mt-5 inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground"
      >
        Continuar estudando
      </Link>
    </div>
  </section>
)}


<section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <div className="rounded-xl border bg-card p-6 shadow-sm">
    <p className="text-sm text-muted-foreground">
      Cursos matriculados
    </p>
    <p className="mt-3 text-3xl font-bold">
      {totalCursos}
    </p>
  </div>

  <div className="rounded-xl border bg-card p-6 shadow-sm">
    <p className="text-sm text-muted-foreground">
      Em andamento
    </p>
    <p className="mt-3 text-3xl font-bold">
      {cursosEmAndamento}
    </p>
  </div>

  <div className="rounded-xl border bg-card p-6 shadow-sm">
    <p className="text-sm text-muted-foreground">
      Cursos concluídos
    </p>
    <p className="mt-3 text-3xl font-bold">
      {cursosConcluidos}
    </p>
  </div>

  <div className="rounded-xl border bg-card p-6 shadow-sm">
    <p className="text-sm text-muted-foreground">
      Progresso médio
    </p>
    <p className="mt-3 text-3xl font-bold">
      {progressoMedio}%
    </p>
  </div>
</section>

      <section className="mt-8 rounded-xl border p-6 shadow-sm">
        <h2 className="text-2xl font-semibold">
          Meus Cursos
        </h2>

        {coursesWithProgress.length === 0 ? (
          <div className="mt-6">
            <p className="text-muted-foreground">
              Você ainda não está matriculado em nenhum curso.
            </p>

            <Link
              href="/courses"
              className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground"
            >
              Explorar cursos
            </Link>
          </div>
        ) : (
          <div className="mt-6">
  <CourseFilters>
    {coursesWithProgress.map((enrollment) => {
              const course = enrollment.course;
              const progress = enrollment.progress;
              const status =
  progress.totalLessons > 0 && progress.percentage === 100
    ? "concluido"
    : "andamento";
              return (
               <div
                   key={enrollment.id}
                  data-status={status}
                    className="rounded-xl border p-5 shadow-sm"
                >
                  <h3 className="text-xl font-semibold">
                    {course.title}
                  </h3>

                  <div className="mt-5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Progresso do curso
                      </span>

                      <span className="font-semibold">
                        {progress.percentage}%
                      </span>
                    </div>

                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${progress.percentage}%`,
                        }}
                      />
                    </div>

                    {progress.totalLessons > 0 &&
  progress.percentage === 100 && (
    <p className="mt-3 font-semibold text-green-600">
      ✓ Curso concluído!
    </p>
  )}
                  </div>

                  {enrollment.nextLessonId ? (
  <Link
    href={`/courses/${course.slug}/lessons/${enrollment.nextLessonId}`}
    className="mt-5 inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground"
  >
    {progress.totalLessons > 0 && progress.percentage === 100
      ? "Revisar curso"
      : "Continuar estudando"}
  </Link>
) : (
  <p className="mt-5 text-sm text-muted-foreground">
    Nenhuma aula disponível neste curso.
  </p>
)}
                </div>
              );
                })}
  </CourseFilters>
</div>
)}
      </section>

      <div className="mt-8">
        <Link
          href="/courses"
          className="inline-block rounded-lg border px-4 py-2"
        >
          Explorar outros cursos
        </Link>
      </div>
    </main>
  );
}
