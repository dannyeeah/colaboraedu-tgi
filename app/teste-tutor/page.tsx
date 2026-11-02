
import TutorChat from "@/components/TutorChat";

export default function PaginaTesteTutor() {
  return (
    <main className="min-h-screen bg-gray-50 p-8 text-gray-900">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-4 text-3xl font-bold">
          ColaboraEdu — Teste do Tutor Virtual
        </h1>

        <h2 className="mb-3 text-xl font-semibold">
          Lesson Nr. 1
        </h2>

        <p className="text-gray-700">
          Esta é uma página temporária para testar
          o Tutor Virtual com uma aula real do Neon.
        </p>
      </div>

      <TutorChat
  cursoId="cmvo8pxr8000098i443gtiiit"
  aulaId=""
  tituloAula="Lesson Nr. 1"
/>
    </main>
  );
}
