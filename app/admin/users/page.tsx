

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
              <tr key={user.id} className="border-t">
                <td className="p-4">{user.name}</td>

                <td className="p-4">{user.email}</td>

                <td className="p-4">
                  {user.role === "admin"
                    ? "Administrador"
                    : "Estudante"}
                </td>

                <td className="p-4">
                  {new Date(user.createdAt).toLocaleDateString(
                    "pt-BR"
                  )}
                </td>

                

<td className="p-4">
  {user.role !== "admin" ? (
    <PromoteUserButton
      userId={user.id}
      userName={user.name}
    />
  ) : (
    <span className="text-muted-foreground">
      Administrador
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
