
"use client";

import { useState } from "react";
import { setUserRole } from "@/app/data/admin/set-user-role";

type PromoteUserButtonProps = {
  userId: string;
  userName: string;
};

export function PromoteUserButton({
  userId,
  userName,
}: PromoteUserButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handlePromote() {
    const confirmed = window.confirm(
      `Deseja realmente tornar ${userName} um administrador do ColaboraEdu?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      await setUserRole(userId);

      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Não foi possível alterar o perfil do usuário.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handlePromote}
      disabled={loading}
      className="rounded-lg bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50"
    >
      {loading ? "Atualizando..." : "Tornar administrador"}
    </button>
  );
}
