
import { notFound } from "next/navigation";
import { getStudentCourse } from "@/app/data/student/get-course";
import TutorChat from "@/components/TutorChat";
import Link from "next/link";

type PageProps = {
  searchParams: Promise<{
    aulaId?: string;
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

      const texto = (bloco.content ?? []).map(extrairTexto).join("");

      if (["paragraph", "heading", "listItem"].includes(bloco.type ?? "")) {
        return texto + "\n";
      }

      return texto;
    }

    return extrairTexto(documento).trim();
  } catch {
    return descricao;
  }
}

export default async function TesteAulaPage({
  searchParams,
}: PageProps) {
  const { aulaId } = await searchParams;

  const cursoId = "cmvo8pxr8000098i443gtiiit";

  const curso = await getStudentCourse(cursoId);

  if (!curso) {
    notFound();
  }

  
const capitulo = aulaId !== undefined
  ? curso.chapter.find((item) =>
      item.lessons.some((lesson) => lesson.id === aulaId)
    )
  : curso.chapter.find((item) => item.lessons.length > 0);

const aula = aulaId !== undefined
  ? capitulo?.lessons.find((lesson) => lesson.id === aulaId)
  : capitulo?.lessons[0];


  if (!capitulo || !aula) {
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
                {formatarConteudoAula(aula.description)}
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
  <Link
    key={lesson.id}
    href={`/teste-aula?aulaId=${encodeURIComponent(lesson.id)}`}
    className={`mt-2 block rounded-lg p-3 text-sm transition-colors hover:bg-accent ${
      lesson.id === aula.id
        ? "bg-primary text-primary-foreground"
        : "bg-muted text-foreground"
    }`}
  >
    ▶ {lesson.title}
  </Link>
))}

              </div>
            ))}
          </aside>
        </div>
      </div>

      <TutorChat
  key={`${curso.id}:${aula.id}`}
  cursoId={curso.id}
  aulaId={aula.id}
  tituloAula={aula.title}
/>
    </main>
  );
}
