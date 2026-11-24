import {
  History,
  BookOpen,
  Trophy,
  Zap,
  Target,
} from "lucide-react";

type XpTransaction = {
  id: string;
  amount: number;
  reason: string;
  createdAt: Date;
};

type XpHistoryProps = {
  transactions: XpTransaction[];
  totalXp: number;
};

const transactionTypes = {
  LESSON_COMPLETED: {
    title: "Aula concluída",
    description: "Você avançou em seu aprendizado!",
    icon: BookOpen,
    color: "bg-blue-100 text-blue-600",
  },
  COURSE_COMPLETED: {
    title: "Curso concluído",
    description: "Parabéns por concluir mais um curso!",
    icon: Trophy,
    color: "bg-amber-100 text-amber-600",
  },
  CHALLENGE_COMPLETED: {
    title: "Desafio concluído",
    description: "Você superou um novo desafio!",
    icon: Target,
    color: "bg-emerald-100 text-emerald-600",
  },
};

export function XpHistory({
  transactions,
  totalXp,
}: XpHistoryProps) {
  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-violet-100 p-3">
            <History className="size-6 text-violet-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              Histórico de XP
            </h2>

            <p className="text-sm text-muted-foreground">
              Acompanhe sua evolução na plataforma.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-amber-100 px-4 py-2 text-sm font-bold text-amber-700">
          ⚡ {totalXp} XP acumulados
        </span>
      </div>

      {/* Histórico vazio */}
      {transactions.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/30 p-8 text-center">
          <Zap className="mx-auto mb-4 size-10 text-violet-400" />

          <h3 className="font-semibold">
            Sua jornada está começando!
          </h3>

          <p className="mt-2 text-sm text-muted-foreground">
            Conclua aulas e cursos para ganhar seus
            primeiros pontos de experiência.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map((transaction) => {
            const type =
              transactionTypes[
                transaction.reason as keyof typeof transactionTypes
              ] ?? {
                title: "Movimentação de XP",
                description: "Atualização da sua pontuação.",
                icon: Zap,
                color: "bg-violet-100 text-violet-600",
              };

            const Icon = type.icon;

            return (
              <div
                key={transaction.id}
                className="flex flex-wrap items-center gap-4 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/30"
              >
                <div
                  className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${type.color}`}
                >
                  <Icon className="size-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold">
                    {type.title}
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    {type.description}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                      timeZone: "America/Sao_Paulo",
                    }).format(transaction.createdAt)}
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-2 text-sm font-bold ${
                    transaction.amount >= 0
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {transaction.amount > 0 ? "+" : ""}
                  {transaction.amount} XP
                </span>
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-5 text-center text-xs text-muted-foreground">
        Exibindo até as 10 movimentações mais recentes.
      </p>
    </section>
  );
}