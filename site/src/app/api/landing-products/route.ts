import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Alimenta a seção "Materiais em destaque" da landing estática
 * (/volta-as-aulas). Só produtos publicados; se o banco não estiver
 * configurado, devolve lista vazia para a landing exibir o fallback.
 */
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { status: "PUBLISHED" },
      include: { category: true },
      orderBy: { updatedAt: "desc" },
      take: 6,
    });

    return NextResponse.json({
      products: products.map((product) => ({
        slug: product.slug,
        title: product.title,
        priceCents: product.priceCents,
        coverImageUrl: product.coverImageUrl,
        category: product.category?.shortLabel ?? null,
      })),
    });
  } catch (error) {
    console.error("landing-products:", error);
    return NextResponse.json({ products: [] });
  }
}
