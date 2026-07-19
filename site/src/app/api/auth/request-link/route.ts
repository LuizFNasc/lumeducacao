import { NextRequest, NextResponse } from "next/server";
import { requestMagicLink } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return NextResponse.redirect(new URL("/entrar?erro=email-invalido", request.url), 303);
  }

  const token = await requestMagicLink(email);

  const url = new URL("/entrar/link-enviado", request.url);
  url.searchParams.set("email", email);
  url.searchParams.set("token", token);
  return NextResponse.redirect(url, 303);
}
