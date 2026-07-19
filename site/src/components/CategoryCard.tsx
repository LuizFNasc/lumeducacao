import Link from "next/link";
import type { Category } from "@/lib/categories";

const COLOR_STYLES: Record<Category["color"], string> = {
  yellow: "bg-brand-yellow/20 text-brand-ink group-hover:bg-brand-yellow",
  orange: "bg-brand-orange/20 text-brand-ink group-hover:bg-brand-orange",
  turquoise: "bg-brand-turquoise/20 text-brand-ink group-hover:bg-brand-turquoise",
  pink: "bg-brand-pink/20 text-brand-ink group-hover:bg-brand-pink",
};

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/catalogo?categoria=${category.slug}`}
      className="group flex flex-col justify-between rounded-3xl border border-black/5 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div
        className={`mb-4 inline-flex w-fit rounded-2xl px-3 py-1 text-xs font-bold uppercase tracking-wide transition-colors ${COLOR_STYLES[category.color]}`}
      >
        {category.stage}
      </div>
      <h3 className="font-heading text-2xl font-semibold text-brand-ink">
        {category.shortLabel}
      </h3>
      <p className="mt-2 text-sm text-brand-ink/70">{category.description}</p>
      <span className="mt-4 text-sm font-bold text-brand-pink">
        Ver materiais →
      </span>
    </Link>
  );
}
