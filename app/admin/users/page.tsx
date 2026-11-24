import { getUsers } from "@/app/data/admin/get-users";
import { PromoteUserButton } from "./_components/PromoteUserButton";

export default async function AdminUsersPage() {
  const users = await getUsers();

  return (
    <main className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">
          Gerenciamento de usuários
        </h1>

        <p className="mt-2 text-muted-foreground">
          Visualize e gerencie os usuários cadastrados no ColaboraEdu.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted">
            <tr>
              <th className="p-4">Nome</th>
              <th className="p-4">E-mail</th>
              <th className="p-4">Perfil</th>
              <th className="p-4">Cadastro</th>
              <th className="p-4">Ações</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr
                key={user.id}
                className="border-t transition-colors hover:bg-muted/30"
              >
                <td className="p-4 font-medium">
                  {user.name}
                </td>

                <td className="p-4">
                  {user.email}
                </td>

                <td className="p-4">
                  {user.role === "superadmin" ? (
                    <span className="inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      Superadministrador
                    </span>
                  ) : user.role === "admin" ? (
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      Professor
                    </span>
                  ) : user.role === "user" ? (
                    <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                      Estudante
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Perfil indefinido
                    </span>
                  )}
                </td>

                <td className="p-4">
                  {new Date(user.createdAt).toLocaleDateString(
                    "pt-BR",
                  )}
                </td>

                <td className="p-4">
                  {user.role === "user" ? (
                    <PromoteUserButton
                      userId={user.id}
                      userName={user.name}
                    />
                  ) : user.role === "superadmin" ? (
                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                      Perfil protegido
                    </span>
                  ) : user.role === "admin" ? (
                    <span className="text-muted-foreground">
                      Professor
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      Indisponível
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <p className="p-6 text-center text-muted-foreground">
            Nenhum usuário cadastrado.
          </p>
        )}
      </div>
    </main>
  );
}