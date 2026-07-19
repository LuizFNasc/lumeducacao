import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { CatalogFilters } from "@/components/CatalogFilters";
import { getCategories, getSubjects, listProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catálogo | Lumeducação",
  description: "Atividades pedagógicas para imprimir, da Educação Infantil ao 5º ano.",
};

interface CatalogoPageProps {
  searchParams: Promise<{ categoria?: string; materia?: string; q?: string }>;
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const { categoria, materia, q } = await searchParams;

  const [categories, subjects, products] = await Promise.all([
    getCategories(),
    getSubjects(),
    listProducts({ categorySlug: categoria, subjectSlug: materia, query: q }),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h1 className="font-heading text-3xl font-semibold text-brand-ink sm:text-4xl">
            Catálogo de atividades
          </h1>
          <p className="mt-2 text-brand-ink/70">
            {products.length}{" "}
            {products.length === 1 ? "material encontrado" : "materiais encontrados"}
          </p>

          <div className="mt-8">
            <CatalogFilters
              categories={categories}
              subjects={subjects}
              activeCategory={categoria}
              activeSubject={materia}
              query={q}
            />
          </div>

          {products.length === 0 ? (
            <div className="mt-16 rounded-3xl border border-dashed border-black/10 bg-white p-12 text-center">
              <p className="font-heading text-xl text-brand-ink">
                Nenhum material encontrado
              </p>
              <p className="mt-2 text-brand-ink/70">
                Tente outros filtros ou volte em breve — estamos publicando novos materiais.
              </p>
            </div>
          ) : (
            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
