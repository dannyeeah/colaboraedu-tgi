import { requireAdmin } from "@/app/data/admin/require-admin";
import { NextResponse } from "next/server";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export async function DELETE(request: Request) {
  await requireAdmin();

  try {
    const body = await request.json();

    if (!body.key) {
      return NextResponse.json(
        { error: "Chave de objeto ausente ou inválida" },
        { status: 400 },
      );
    }

    await utapi.deleteFiles(body.key);

    return NextResponse.json(
      { message: "Arquivo deletado com sucesso" },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Não foi possível deletar o arquivo" },
      { status: 500 },
    );
  }
}
