import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error: "Esta rota foi desativada.",
      message: "Utilize o serviço autenticado do UploadThing.",
    },
    {
      status: 410,
    },
  );
}