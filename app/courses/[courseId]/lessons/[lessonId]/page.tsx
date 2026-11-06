
import Link from "next/link";
import { notFound } from "next/navigation";
import TutorChat from "@/components/TutorChat";
import { getStudentCourse } from "@/app/data/student/get-course";

type PageProps = {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
};

type BlocoConteudo = {
  type?: string;
  text?: string;
  content?: BlocoConteudo[];
};

function formatarConteudoAula(descricao: string | null | undefined): string {
  if (!descricao) return "Descrição não disponível.";

  try {
    const documento: BlocoConteudo = JSON.parse(descricao);

    function extrairTexto(bloco: BlocoConteudo): string {
      if (bloco.type === "text") {
        return bloco.text ?? "";
      }

      const texto = (bloco.content ?? [])
        .map(extrairTexto)
        .join("");

      if (
        ["paragraph", "heading", "listItem"].includes(
          bloco.type ?? ""
        )
      ) {
        return texto + "\n";
      }

      return texto;
    }

    return extrairTexto(documento).trim();
  } catch {
    return descricao;
  }
}

export default async function LessonPage({ params }: PageProps) {
  const { courseId, lessonId } = await params;

  const curso = await getStudentCourse(courseId);

  if (!curso) {
    notFound();
  }

  const aulas = curso.chapter.flatMap((capitulo) =>
    capitulo.lessons.map((aula) => ({
      ...aula,
      capitulo: capitulo.title,
    }))
  );

  const aulaAtual = aulas.find((aula) => aula.id === lessonId);

  if (!aulaAtual) {
    notFound();
  }

  const videoUrl = aulaAtual.videoKey
    ? aulaAtual.videoKey.startsWith("http")
      ? aulaAtual.videoKey
      : `https://utfs.io/f/${aulaAtual.videoKey}`
    : null;

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-muted-foreground">
          ← Voltar ao início
        </Link>

        <h1 className="mt-6 text-3xl font-bold">{curso.title}</h1>

        <p className="mt-2 text-muted-foreground">
          {curso.smallDescription}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <section className="lg:col-span-2">
            <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-black">
              {videoUrl ? (
                <video
                  src={videoUrl}
                  controls
                  className="h-full w-full"
                >
                  Seu navegador não suporta vídeos.
                </video>
              ) : (
                <p className="text-white">
                  Esta aula ainda não possui vídeo.
                </p>
              )}
            </div>

            <h2 className="mt-6 text-2xl font-semibold">
              {aulaAtual.title}
            </h2>

            <p className="mt-2 text-sm text-muted-foreground">
              {aulaAtual.capitulo}
            </p>

            <div className="mt-6 whitespace-pre-wrap">
              {formatarConteudoAula(aulaAtual.description)}
            </div>
          </section>

          <aside className="rounded-xl border p-5">
            <h2 className="mb-5 text-xl font-semibold">
              Conteúdo do curso
            </h2>

            {curso.chapter.map((capitulo) => (
              <div key={capitulo.id} className="mb-6">
                <h3 className="mb-3 font-semibold">
                  {capitulo.title}
                </h3>

                <div className="space-y-2">
                  {capitulo.lessons.map((aula) => (
                    <Link
                      key={aula.id}
                      href={`/courses/${courseId}/lessons/${aula.id}`}
                      className={`block rounded-lg p-3 text-sm ${
                        aula.id === lessonId
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-accent"
                      }`}
                    >
                      ▶ {aula.title}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </aside>
        </div>
      </div>

      
<TutorChat
  key={`${courseId}:${lessonId}`}
  cursoId={courseId}
  aulaId={lessonId}
  tituloAula={aulaAtual.title}
/>

    </main>
  );
}
