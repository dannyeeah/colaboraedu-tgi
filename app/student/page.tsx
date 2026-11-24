import Link from "next/link";
import { getXpHistory } from "@/app/data/student/get-xp-history";
import { XpHistory } from "./_components/xp-history";
import { CourseFilters } from "./_components/course-filters";
import { requireStudent } from "@/app/data/student/require-student";
import { getMyCourses } from "@/app/data/student/get-my-courses";
import { getCourseProgress } from "@/app/data/student/get-course-progress";
import { getNextLesson } from "@/app/data/student/get-next-lesson";
import { getUserGamification } from "@/app/data/student/get-user-gamification";

import { AchievementsPanel } from "./_components/achievements-panel";
import { getUserAchievements } from "@/app/data/student/get-user-achievements";

export default async function StudentPage() {
  const session = await requireStudent();

  const [enrollments, gamification, achievements, xpHistory] =
  await Promise.all([
    getMyCourses(),
    getUserGamification(),
    getUserAchievements(),
    getXpHistory(),
  ]);

  const nome = session.user.name || "Estudante";

  const coursesWithProgress = await Promise.all(
    enrollments.map(async (enrollment) => {      const [progress, nextLessonId] = await Promise.all([
        getCourseProgress(enrollment.courseId),
        getNextLesson(enrollment.courseId),      ]);

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
      {/* Navegação */}
      <div className="mb-8 flex flex-wrap gap-3">
        <Link
          href="/"
          className="rounded-xl border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          ← Página Inicial
        </Link>

        <Link
          href="/courses"
          className="colabora-button"
        >
          Explorar Cursos
        </Link>
      </div>

      {/* Banner de boas-vindas */}
      <section className="colabora-gradient relative overflow-hidden rounded-3xl p-8 shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
            Seu espaço de aprendizagem
          </p>

          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Olá, {nome}! 👋
          </h1>

          <p className="mt-4 text-base leading-relaxed text-white/90">
            Seu próximo grande aprendizado começa aqui.
            Continue explorando, conquistando XP e evoluindo!
          </p>

          <div className="mt-6 inline-flex rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white">
            🚀 Aprenda • Colabore • Evolua
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-white/10"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-20 h-64 w-64 rounded-full bg-white/10"
        />
      </section>

      {/* Gamificação */}
      <section className="colabora-card mt-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Minha Jornada de Aprendizagem 🚀
            </h2>

            <p className="mt-2 text-muted-foreground">
              Cada aula concluída é um passo para uma nova conquista!
            </p>
          </div>

          <div
            aria-hidden="true"
            className="rounded-2xl bg-violet-100 p-4 text-3xl"
          >
            ✨
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {/* XP acumulado */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-center gap-2 text-amber-800">
              <span aria-hidden="true" className="text-2xl">
                ⚡
              </span>
              <span className="font-semibold">
                XP acumulado
              </span>
            </div>

            <p className="mt-4 text-4xl font-extrabold text-amber-900">
              {gamification.totalXp}
              <span className="ml-2 text-lg">XP</span>
            </p>

            <p className="mt-2 text-sm text-amber-800">
              Seu esforço vale pontos!
            </p>
          </div>

          {/* Nível atual */}
          <div className="rounded-2xl border border-violet-200 bg-violet-50 p-6">
            <div className="flex items-center gap-2 text-violet-800">
              <span aria-hidden="true" className="text-2xl">
                🏅
              </span>
              <span className="font-semibold">
                Nível atual
              </span>
            </div>

            <p className="mt-4 text-2xl font-extrabold text-violet-900">
              {gamification.level} — {gamification.levelName}
            </p>

            <p className="mt-2 text-sm text-violet-800">
              Continue evoluindo!
            </p>
          </div>
        </div>

        {/* Progresso para o próximo nível */}
        <div className="mt-6 rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between gap-4">
            <p className="font-semibold">
              Rumo ao próximo nível
            </p>

            <span className="font-bold text-primary">
              {gamification.progressPercentage}%
            </span>
          </div>

          <div
            role="progressbar"
            aria-label="Progresso para o próximo nível"
            aria-valuenow={gamification.progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            className="mt-4 h-4 overflow-hidden rounded-full bg-violet-100"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-600 to-sky-400 transition-all duration-500"
              style={{
                width: `${gamification.progressPercentage}%`,
              }}
            />
          </div>

          <p className="mt-3 text-sm text-muted-foreground">
            {gamification.nextLevelMinXp !== null
              ? `✨ Faltam ${gamification.xpToNextLevel} XP para o próximo nível!`
              : "🏆 Parabéns! Você alcançou o nível máximo!"}
          </p>
        </div>
      </section>

      {/* Conquistas e medalhas */}
      <div className="mt-8">
        <AchievementsPanel achievements={achievements} />
      </div>

{/* Histórico de XP */}
<div className="mt-8">
  <XpHistory
    transactions={xpHistory}
    totalXp={gamification.totalXp}
  />
</div>

      {/* Continuar aprendendo */}
      {cursoParaContinuar && (
        <section className="colabora-card mt-8">
          <h2 className="text-2xl font-bold">
            📖 Continuar Aprendendo
          </h2>

          <p className="mt-2 text-muted-foreground">
            Continue sua jornada de aprendizagem de onde parou.
          </p>

          <div className="mt-6 rounded-2xl border bg-secondary/40 p-5">
            <h3 className="text-xl font-semibold">
              {cursoParaContinuar.course.title}
            </h3>

            <div className="mt-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Seu progresso
                </span>

                <span className="font-semibold text-primary">
                  {cursoParaContinuar.progress.percentage}%
                </span>
              </div>

              <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-600 to-sky-400"
                  style={{
                    width: `${cursoParaContinuar.progress.percentage}%`,
                  }}
                />
              </div>
            </div>

            <Link
              href={`/courses/${cursoParaContinuar.course.slug}/lessons/${cursoParaContinuar.nextLessonId}`}
              className="colabora-button mt-5"
            >
              Continuar estudando
            </Link>
          </div>
        </section>
      )}

      {/* Indicadores do estudante */}
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="colabora-card border-sky-200 bg-sky-50">
          <p className="font-medium text-sky-800">
            📚 Cursos matriculados
          </p>
          <p className="mt-3 text-3xl font-extrabold text-sky-900">
            {totalCursos}
          </p>
        </div>

        <div className="colabora-card border-violet-200 bg-violet-50">
          <p className="font-medium text-violet-800">
            🚀 Em andamento
          </p>
          <p className="mt-3 text-3xl font-extrabold text-violet-900">
            {cursosEmAndamento}
          </p>
        </div>

        <div className="colabora-card border-emerald-200 bg-emerald-50">
          <p className="font-medium text-emerald-800">
            🏆 Cursos concluídos
          </p>
          <p className="mt-3 text-3xl font-extrabold text-emerald-900">
            {cursosConcluidos}
          </p>
        </div>

        <div className="colabora-card border-amber-200 bg-amber-50">
          <p className="font-medium text-amber-800">
            📈 Progresso médio
          </p>
          <p className="mt-3 text-3xl font-extrabold text-amber-900">
            {progressoMedio}%
          </p>
        </div>
      </section>

      {/* Meus cursos */}
      <section className="colabora-card mt-8">
        <h2 className="text-2xl font-bold">          🎓 Meus Cursos
        </h2>

        {coursesWithProgress.length === 0 ? (
          <div className="mt-6">
            <p className="text-muted-foreground">
              Você ainda não está matriculado em nenhum curso.
            </p>

            <Link
              href="/courses"
              className="colabora-button mt-4"
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
                  progress.totalLessons > 0 &&
                  progress.percentage === 100
                    ? "concluido"
                    : "andamento";

                return (
                  <div
                    key={enrollment.id}
                    data-status={status}
                    className="rounded-2xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <h3 className="text-xl font-semibold">
                      {course.title}
                    </h3>

                    <div className="mt-5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Progresso do curso
                        </span>

                        <span className="font-semibold text-primary">
                          {progress.percentage}%
                        </span>
                      </div>

                      <div className="mt-2 h-3 overflow-hidden rounded-full bg-muted">                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-600 to-sky-400 transition-all"
                          style={{
                            width: `${progress.percentage}%`,
                          }}
                        />
                      </div>

                      {progress.totalLessons > 0 &&
                        progress.percentage === 100 && (
                          <p className="mt-3 font-semibold text-emerald-600">
                            ✓ Curso concluído!
                          </p>
                        )}
                    </div>

                    {enrollment.nextLessonId ? (
                      <Link
                        href={`/courses/${course.slug}/lessons/${enrollment.nextLessonId}`}
                        className="colabora-button mt-5"
                      >
                        {progress.totalLessons > 0 &&
                        progress.percentage === 100
                          ? "Revisar curso"                          : "Continuar estudando"}
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

      {/* Explorar mais cursos */}
      <div className="mt-8">
        <Link
          href="/courses"
          className="inline-flex rounded-xl border bg-card px-5 py-3 font-semibold transition-colors hover:bg-accent"
        >
          Explorar outros cursos
        </Link>
      </div>
    </main>
  );
}
