import { Trophy, Lock, CheckCircle2 } from "lucide-react";

type Achievement = {
  id: string;
  code: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: Date | null;
};

type AchievementsPanelProps = {
  achievements: Achievement[];
};

export function AchievementsPanel({
  achievements,
}: AchievementsPanelProps) {
  const total = achievements.length;

  const unlocked = achievements.filter(
    (achievement) => achievement.unlocked
  ).length;

  const percentage =
    total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return (
    <section className="rounded-2xl border bg-card p-6 shadow-sm">
      {/* Cabeçalho */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-amber-100 p-3">
            <Trophy className="size-6 text-amber-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              Minhas conquistas
            </h2>

            <p className="text-sm text-muted-foreground">
              Aprenda, evolua e desbloqueie novas medalhas!
            </p>
          </div>
        </div>

        <span className="rounded-full bg-violet-100 px-4 py-2 text-sm font-semibold text-violet-700">
          {unlocked} de {total} conquistadas
        </span>
      </div>

      {/* Barra de progresso */}
      <div className="mb-6">
        <div className="mb-2 flex justify-between text-sm">
          <span className="font-medium">
            Progresso das conquistas
          </span>

          <span className="font-bold text-violet-600">
            {percentage}%
          </span>
        </div>

        <div
          className="h-3 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Progresso das conquistas"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-violet-600 to-blue-500 transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Medalhas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`relative flex flex-col items-center rounded-2xl border p-5 text-center transition-all ${
              achievement.unlocked
                ? "border-violet-200 bg-gradient-to-b from-violet-50 to-white shadow-sm hover:-translate-y-1 hover:shadow-md dark:border-violet-800 dark:from-violet-950 dark:to-card"
                : "border-border bg-muted/50"
            }`}
          >
            {/* Status */}
            <div className="absolute right-3 top-3">
              {achievement.unlocked ? (
                <CheckCircle2 className="size-5 text-emerald-500" />
              ) : (
                <Lock className="size-4 text-muted-foreground" />
              )}
            </div>

            {/* Ícone da medalha */}
            <div
              className={`mb-4 flex size-20 items-center justify-center rounded-full text-4xl ${
                achievement.unlocked
                  ? "bg-violet-100 shadow-sm"
                  : "bg-muted grayscale opacity-50"
              }`}
            >
              {achievement.icon}
            </div>

            <h3 className="mb-2 font-bold">
              {achievement.title}
            </h3>

            <p className="mb-4 text-xs text-muted-foreground">
              {achievement.description}
            </p>

            <div className="mt-auto">
              {achievement.unlocked ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Conquistada
                </span>
              ) : (
                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                  Bloqueada
                </span>
              )}

              {achievement.unlockedAt && (
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Intl.DateTimeFormat("pt-BR", {
                    timeZone: "America/Sao_Paulo",
                  }).format(achievement.unlockedAt)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}