import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { formatPriceCents } from "@/lib/format";
import { getProductBySlug } from "@/lib/products";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout | Lumeducação",
};

const ERROR_MESSAGES: Record<string, string> = {
  "dados-invalidos": "Preencha um e-mail válido para continuar.",
  "produto-indisponivel": "Não foi possível iniciar a compra desse material. Tente novamente.",
};

interface CheckoutPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ erro?: string }>;
}

export default async function CheckoutPage({ params, searchParams }: CheckoutPageProps) {
  const { slug } = await params;
  const { erro } = await searchParams;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
          <div className="rounded-2xl bg-brand-turquoise/10 px-4 py-2 text-center text-xs font-semibold text-brand-ink">
            Ambiente de teste — nenhum pagamento real é processado aqui
          </div>

          <h1 className="mt-6 font-heading text-2xl font-semibold text-brand-ink">
            Finalizar compra
          </h1>

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
            <span className="font-semibold text-brand-ink">{product.title}</span>
            <span className="font-bold text-brand-ink">
              {formatPriceCents(product.priceCents)}
            </span>
          </div>

          {erro && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {ERROR_MESSAGES[erro] ?? "Não foi possível continuar. Tente novamente."}
            </p>
          )}

          <form action="/api/checkout" method="post" className="mt-6 space-y-4">
            <input type="hidden" name="productSlug" value={product.slug} />

            <div>
              <label htmlFor="name" className="text-sm font-semibold text-brand-ink">
                Nome
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                className="mt-1 w-full rounded-xl border border-black/10 px-4 py-2 text-sm focus:border-brand-turquoise focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-semibold text-brand-ink">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="mt-1 w-full rounded-xl border border-black/10 px-4 py-2 text-sm focus:border-brand-turquoise focus:outline-none"
              />
              <p className="mt-1 text-xs text-brand-ink/60">
                É por esse e-mail que você vai acessar seus materiais depois.
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-full bg-brand-pink px-6 py-3 text-sm font-bold text-white transition hover:brightness-105"
            >
              Continuar para pagamento
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
