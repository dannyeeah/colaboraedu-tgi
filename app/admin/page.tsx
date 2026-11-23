
import { prisma } from "@/lib/db";
import {
  BookOpenIcon,
  UsersIcon,
  ClipboardListIcon,
  CheckCircleIcon,
} from "lucide-react";

export default async function AdminIndexPage() {
  const [
    totalCursos,
    totalUsuarios,
    matriculasAtivas,
    cursosConcluidos,
  ] = await Promise.all([
    prisma.course.count(),
    prisma.user.count(),
    prisma.enrollment.count({
      where: { status: "Active" },
    }),
    prisma.enrollment.count({
      where: {
        status: "Active",
        course: {
          chapter: {
            some: {
              lessons: {
                some: {},
              },
            },
          },
        },
      },
    }),
  ]);

  const indicadores = [
    {
      titulo: "Total de Cursos",
      valor: totalCursos,
      icon: BookOpenIcon,
    },
    {
      titulo: "Usuários Cadastrados",
      valor: totalUsuarios,
      icon: UsersIcon,
    },
    {
      titulo: "Matrículas Ativas",
      valor: matriculasAtivas,
      icon: ClipboardListIcon,
    },
    {
      titulo: "Cursos com Aulas",
      valor: cursosConcluidos,
      icon: CheckCircleIcon,
    },
  ];

  return (
    <main className="space-y-8 px-4 py-8 lg:px-6">
      <div>
        <h1 className="text-3xl font-bold">
          Painel Administrativo
        </h1>
        <p className="mt-2 text-muted-foreground">
          Acompanhe os principais indicadores do ColaboraEdu.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {indicadores.map((indicador) => {
          const Icon = indicador.icon;

          return (
            <div
              key={indicador.titulo}
              className="rounded-xl border bg-card p-6 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {indicador.titulo}
                </p>
                <Icon className="size-5 text-muted-foreground" />
              </div>

              <p className="mt-4 text-3xl font-bold">
                {indicador.valor}
              </p>
            </div>
          );
        })}
      </section>
    </main>
  );
}
