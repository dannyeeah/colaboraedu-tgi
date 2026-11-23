
"use client";

import {
  Children,
  isValidElement,
  useState,
  type ReactNode,
} from "react";

type Filter = "todos" | "andamento" | "concluidos";

interface CourseFiltersProps {
  children: ReactNode;
}

export function CourseFilters({ children }: CourseFiltersProps) {
  const [filter, setFilter] = useState<Filter>("todos");

  const cursosFiltrados = Children.toArray(children).filter((child) => {
    if (filter === "todos") return true;

    if (!isValidElement<{ "data-status"?: string }>(child)) {
      return false;
    }

    return child.props["data-status"] ===
      (filter === "concluidos" ? "concluido" : "andamento");
  });

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setFilter("todos")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            filter === "todos"
              ? "bg-primary text-primary-foreground"
              : "border hover:bg-muted"
          }`}
        >
          Todos
        </button>

        <button
          type="button"
          onClick={() => setFilter("andamento")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            filter === "andamento"
              ? "bg-primary text-primary-foreground"
              : "border hover:bg-muted"
          }`}
        >
          Em andamento
        </button>

        <button
          type="button"
          onClick={() => setFilter("concluidos")}
          className={`rounded-lg px-4 py-2 text-sm font-medium ${
            filter === "concluidos"
              ? "bg-primary text-primary-foreground"
              : "border hover:bg-muted"
          }`}
        >
          Concluídos
        </button>
      </div>

      {cursosFiltrados.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cursosFiltrados}
        </div>
      ) : (
        <p className="py-6 text-sm text-muted-foreground">
          Nenhum curso encontrado neste filtro.
        </p>
      )}
    </div>
  );
}
