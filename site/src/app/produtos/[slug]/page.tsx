import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { formatPriceCents } from "@/lib/format";
import { getProductBySlug } from "@/lib/products";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

const FILE_KIND_LABELS: Record<string, string> = {
  PDF: "PDF pronto para imprimir",
  EDITABLE: "Arquivo editável",
  IMAGE: "Imagem",
  VIDEO: "Vídeo bônus",
  OTHER: "Arquivo extra",
};

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.title} | Lumeducação`,
    description: product.description.slice(0, 160),
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const fileKindCounts = product.files.reduce<Record<string, number>>((acc, file) => {
    acc[file.kind] = (acc[file.kind] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <nav className="mb-6 text-sm text-brand-ink/60">
            <Link href="/catalogo" className="hover:text-brand-pink">
              Catálogo
            </Link>
            {product.category && (
              <>
                {" / "}
                <Link
                  href={`/catalogo?categoria=${product.category.slug}`}
                  className="hover:text-brand-pink"
                >
                  {product.category.shortLabel}
                </Link>
              </>
            )}
          </nav>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <div className="flex aspect-[4/3] items-center justify-center rounded-3xl bg-gradient-to-br from-brand-turquoise/30 to-brand-yellow/30 text-6xl">
              📚
            </div>

            <div>
              {product.category && (
                <span className="mb-3 inline-flex w-fit rounded-full bg-brand-turquoise/20 px-3 py-1 text-xs font-bold uppercase tracking-wide text-brand-ink">
                  {product.category.shortLabel}
                </span>
              )}
              <h1 className="font-heading text-3xl font-semibold text-brand-ink sm:text-4xl">
                {product.title}
              </h1>
              <p className="mt-4 whitespace-pre-line text-brand-ink/70">
                {product.description}
              </p>

              {product.subjects.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {product.subjects.map(({ subject }) => (
                    <span
                      key={subject.id}
                      className="rounded-full bg-brand-ink/5 px-3 py-1 text-xs font-semibold text-brand-ink/70"
                    >
                      {subject.name}
                    </span>
                  ))}
                </div>
              )}

              {Object.keys(fileKindCounts).length > 0 && (
                <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
                  <p className="font-heading text-sm font-semibold text-brand-ink">
                    O que está incluso
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-brand-ink/70">
                    {Object.entries(fileKindCounts).map(([kind, count]) => (
                      <li key={kind}>
                        {count}x {FILE_KIND_LABELS[kind] ?? kind}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-8 flex items-center gap-4">
                <span className="font-heading text-3xl font-semibold text-brand-ink">
                  {formatPriceCents(product.priceCents)}
                </span>
              </div>

              <button
                type="button"
                disabled
                className="mt-6 w-full rounded-full bg-brand-pink px-6 py-3 text-sm font-bold text-white opacity-60 sm:w-auto"
              >
                Comprar (checkout em breve)
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
