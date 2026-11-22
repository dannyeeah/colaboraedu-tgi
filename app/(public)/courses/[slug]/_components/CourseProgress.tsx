
type CourseProgressProps = {
  totalLessons: number;
  completedLessons: number;
  percentage: number;
};

export function CourseProgress({
  totalLessons,
  completedLessons,
  percentage,
}: CourseProgressProps) {
  const progress = Math.min(100, Math.max(0, percentage));

  return (
    <div className="mt-6 rounded-xl border bg-card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">
          Seu progresso no curso
        </h3>

        <span className="text-lg font-bold text-primary">
          {progress}%
        </span>
      </div>

      <div
        className="h-3 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label="Progresso do curso"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-3 text-sm text-muted-foreground">
        {completedLessons} de {totalLessons} aulas concluídas
      </p>

      {totalLessons > 0 && progress === 100 && (
        <p className="mt-3 font-medium text-primary">
          🎉 Parabéns! Você concluiu todas as aulas!
        </p>
      )}
    </div>
  );
}
