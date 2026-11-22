
import Link from "next/link";
import { requireStudent } from "@/app/data/student/require-student";

export default async function StudentPage() {
  const session = await requireStudent();

  const nome = session.user.name || "Estudante";

  return (
    <main className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold">
        Olá, {nome}! 👋
      </h1>

      <p className="mt-3 text-muted-foreground">
        Bem-vindo ao seu espaço de aprendizagem
        no ColaboraEdu.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Explorar cursos
          </h2>

          <p className="mt-2 text-muted-foreground">
            Descubra novos cursos e amplie seus
            conhecimentos.
          </p>

          <Link
            href="/courses"
            className="mt-4 inline-block rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          >
            Ver cursos
          </Link>
        </div>

        <div className="rounded-xl border p-6 shadow-sm">
          <h2 className="text-xl font-semibold">
            Meu aprendizado
          </h2>

          <p className="mt-2 text-muted-foreground">
            Em breve, você poderá acompanhar
            seu progresso nos cursos.
          </p>
        </div>
      </div>
    </main>
  );
}
