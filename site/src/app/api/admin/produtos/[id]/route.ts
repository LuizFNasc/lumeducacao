import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { updateProductForAdmin } from "@/lib/products";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const user = await getSessionUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { id } = await params;
  const formData = await request.formData();

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceReais = String(formData.get("priceReais") ?? "0");
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const coverImageUrl = String(formData.get("coverImageUrl") ?? "").trim();
  const status = String(formData.get("status") ?? "DRAFT");

  if (!title) {
    return NextResponse.redirect(new URL(`/admin/produtos/${id}?erro=titulo`, request.url), 303);
  }

  const priceCents = Math.round(parseFloat(priceReais.replace(",", ".")) * 100);
  const validStatus = ["DRAFT", "PUBLISHED", "ARCHIVED"].includes(status)
    ? (status as "DRAFT" | "PUBLISHED" | "ARCHIVED")
    : "DRAFT";

  await updateProductForAdmin(id, {
    title,
    description,
    priceCents: Number.isFinite(priceCents) ? priceCents : 0,
    categoryId: categoryId || null,
    coverImageUrl: coverImageUrl || null,
    status: validStatus,
  });

  return NextResponse.redirect(new URL(`/admin/produtos/${id}`, request.url), 303);
}
