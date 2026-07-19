import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { resolveDownload } from "@/lib/downloads";

interface RouteParams {
  params: Promise<{ fileId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { fileId } = await params;
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.redirect(new URL("/entrar", request.url), 303);
  }

  const result = await resolveDownload(user.id, fileId);

  if (!result.ok) {
    const message =
      result.reason === "not-synced"
        ? "Esse arquivo ainda não foi sincronizado para download."
        : "Você não tem acesso a este arquivo.";
    return NextResponse.json({ error: message }, { status: result.reason === "not-synced" ? 409 : 403 });
  }

  return NextResponse.redirect(result.url, 303);
}
