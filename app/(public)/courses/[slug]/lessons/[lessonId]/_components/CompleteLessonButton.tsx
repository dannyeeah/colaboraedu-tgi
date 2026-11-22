
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeLesson } from "@/app/data/student/complete-lesson";

type CompleteLessonButtonProps = {
  lessonId: string;
  completed: boolean;
};

export function CompleteLessonButton({
  lessonId,
  completed,
}: CompleteLessonButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleComplete() {
    try {
      setLoading(true);

      await completeLesson(lessonId);

      router.refresh();
    } catch (error) {
      console.error(error);
      alert(
        "Não foi possível concluir a aula. Verifique se sua matrícula está ativa."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleComplete}
      disabled={loading || completed}
      className="mt-6 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
    >
      {completed
        ? "✓ Aula concluída"
        : loading
          ? "Salvando..."
          : "Marcar como concluída"}
    </button>
  );
}
