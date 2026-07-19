import Link from "next/link";
import type { Category, Subject } from "@/generated/prisma/client";

interface CatalogFiltersProps {
  categories: Category[];
  subjects: Subject[];
  activeCategory?: string;
  activeSubject?: string;
  query?: string;
}

function buildHref(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const queryString = search.toString();
  return queryString ? `/catalogo?${queryString}` : "/catalogo";
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
        active
          ? "border-brand-pink bg-brand-pink text-white"
          : "border-black/10 bg-white text-brand-ink/80 hover:border-brand-pink"
      }`}
    >
      {children}
    </Link>
  );
}

export function CatalogFilters({
  categories,
  subjects,
  activeCategory,
  activeSubject,
  query,
}: CatalogFiltersProps) {
  return (
    <div className="space-y-5">
      <form action="/catalogo" method="get" className="flex gap-2">
        {activeCategory && <input type="hidden" name="categoria" value={activeCategory} />}
        {activeSubject && <input type="hidden" name="materia" value={activeSubject} />}
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Buscar por palavra-chave..."
          className="w-full rounded-full border border-black/10 px-4 py-2 text-sm focus:border-brand-turquoise focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-full bg-brand-ink px-5 py-2 text-sm font-bold text-white"
        >
          Buscar
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <FilterPill href={buildHref({ materia: activeSubject, q: query })} active={!activeCategory}>
          Todas as séries
        </FilterPill>
        {categories.map((category) => (
          <FilterPill
            key={category.id}
            href={buildHref({ categoria: category.slug, materia: activeSubject, q: query })}
            active={activeCategory === category.slug}
          >
            {category.shortLabel}
          </FilterPill>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterPill href={buildHref({ categoria: activeCategory, q: query })} active={!activeSubject}>
          Todas as matérias
        </FilterPill>
        {subjects.map((subject) => (
          <FilterPill
            key={subject.id}
            href={buildHref({ categoria: activeCategory, materia: subject.slug, q: query })}
            active={activeSubject === subject.slug}
          >
            {subject.name}
          </FilterPill>
        ))}
      </div>
    </div>
  );
}
