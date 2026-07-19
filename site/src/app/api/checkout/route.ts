import { NextRequest, NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const productSlug = String(formData.get("productSlug") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();

  if (!productSlug || !email || !email.includes("@")) {
    return NextResponse.redirect(
      new URL(`/checkout/${productSlug}?erro=dados-invalidos`, request.url),
      303,
    );
  }

  try {
    const order = await createOrder({ productSlug, email, name: name || undefined });
    return NextResponse.redirect(new URL(`/pedido/${order.id}`, request.url), 303);
  } catch (error) {
    console.error("Falha ao criar pedido:", error);
    return NextResponse.redirect(
      new URL(`/checkout/${productSlug}?erro=produto-indisponivel`, request.url),
      303,
    );
  }
}
