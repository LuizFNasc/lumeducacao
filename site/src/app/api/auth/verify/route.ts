import { NextRequest, NextResponse } from "next/server";
import { consumeMagicLink } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/entrar?erro=link-invalido", request.url), 303);
  }

  const session = await consumeMagicLink(token);

  if (!session) {
    return NextResponse.redirect(new URL("/entrar?erro=link-expirado", request.url), 303);
  }

  return NextResponse.redirect(new URL("/meus-materiais", request.url), 303);
}
