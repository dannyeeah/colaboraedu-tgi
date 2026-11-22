
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { enrollCourse } from "@/app/data/student/enroll-course";

type EnrollCourseButtonProps = {
  courseId: string;
  enrolled: boolean;
};

export function EnrollCourseButton({
  courseId,
  enrolled,
}: EnrollCourseButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleEnroll() {
    try {
      setLoading(true);

      const enrollment = await enrollCourse(courseId);

      if (enrollment.status !== "Active") {
        alert(
          "Sua matrícula já existe, mas não está ativa."
        );
        return;
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Não foi possível realizar a matrícula.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleEnroll}
      disabled={loading || enrolled}
      className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {enrolled
        ? "✓ Você já está matriculado"
        : loading
          ? "Realizando matrícula..."
          : "Inscrever-se gratuitamente"}
    </button>
  );
}
