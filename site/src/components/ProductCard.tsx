import Link from "next/link";
import { formatPriceCents } from "@/lib/format";
import type { ProductListItem } from "@/lib/products";

const CATEGORY_BADGE_STYLES: Record<string, string> = {
  YELLOW: "bg-brand-yellow/20 text-brand-ink",
  ORANGE: "bg-brand-orange/20 text-brand-ink",
  TURQUOISE: "bg-brand-turquoise/20 text-brand-ink",
  PINK: "bg-brand-pink/20 text-brand-ink",
};

const COVER_GRADIENTS: Record<string, string> = {
  YELLOW: "from-brand-yellow/40 to-brand-orange/30",
  ORANGE: "from-brand-orange/40 to-brand-pink/30",
  TURQUOISE: "from-brand-turquoise/40 to-brand-yellow/30",
  PINK: "from-brand-pink/40 to-brand-turquoise/30",
};

export function ProductCard({ product }: { product: ProductListItem }) {
  const colorKey = product.category?.color ?? "TURQUOISE";

  return (
    <Link
      href={`/produtos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div
        className={`flex aspect-[4/3] items-center justify-center bg-gradient-to-br text-4xl ${COVER_GRADIENTS[colorKey]}`}
      >
        📚
      </div>
      <div className="flex flex-1 flex-col p-5">
        {product.category && (
          <span
            className={`mb-2 inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${CATEGORY_BADGE_STYLES[colorKey]}`}
          >
            {product.category.shortLabel}
          </span>
        )}
        <h3 className="font-heading text-lg font-semibold text-brand-ink group-hover:text-brand-pink">
          {product.title}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-lg font-bold text-brand-ink">
            {formatPriceCents(product.priceCents)}
          </span>
          <span className="text-sm font-bold text-brand-pink">Ver mais →</span>
        </div>
      </div>
    </Link>
  );
}
