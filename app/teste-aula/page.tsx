
import { notFound } from "next/navigation";
import { getStudentCourse } from "@/app/data/student/get-course";
import TutorChat from "@/components/TutorChat";

export default async function TesteAulaPage() {
  const cursoId = "cmvo8pxr8000098i443gtiiit";

  const curso = await getStudentCourse(cursoId);

  if (!curso) {
    notFound();
  }

  const capitulo = curso.chapter.find(
    (item) => item.lessons.length > 0
  );

  const aula = capitulo?.lessons[0];

  if (!aula) {
    notFound();
  }

  const videoUrl = aula.videoKey
    ? aula.videoKey.startsWith("http")
      ? aula.videoKey
      : `https://utfs.io/f/${aula.videoKey}`
    : null;

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold">{curso.title}</h1>

        <p className="mt-2 text-muted-foreground">
          {capitulo.title}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-black">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="h-full w-full"
                />
              ) : (
                <p className="text-white">
                  Esta aula ainda não possui vídeo.
                </p>
              )}
            </div>

            <h2 className="mt-6 text-2xl font-semibold">
              {aula.title}
            </h2>

            <p className="mt-4 whitespace-pre-wrap">
              {aula.description || "Descrição não disponível."}
            </p>
          </section>

          <aside className="rounded-xl border p-5">
            <h2 className="mb-4 text-xl font-semibold">
              Conteúdo do curso
            </h2>

            {curso.chapter.map((item) => (
              <div key={item.id} className="mb-5">
                <h3 className="font-semibold">{item.title}</h3>

                {item.lessons.map((lesson) => (
                  <p
                    key={`${item.id}-${lesson.position}`}
                    className="mt-2 rounded-lg bg-muted p-3 text-sm"
                  >
                    ▶ {lesson.title}
                  </p>
                ))}
              </div>
            ))}
          </aside>
        </div>
      </div>

      <TutorChat
        cursoId={curso.id}
        aulaId={aula.id}
        tituloAula={aula.title}
      />
    </main>
  );
}
