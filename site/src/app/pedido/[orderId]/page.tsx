import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { formatPriceCents } from "@/lib/format";
import { getOrderById } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meu pedido | Lumeducação",
};

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Aguardando pagamento", className: "bg-brand-yellow/20 text-brand-ink" },
  PAID: { label: "Pagamento aprovado", className: "bg-green-100 text-green-800" },
  FAILED: { label: "Pagamento falhou", className: "bg-red-100 text-red-700" },
  CANCELED: { label: "Cancelado", className: "bg-black/5 text-brand-ink/60" },
  REFUNDED: { label: "Reembolsado", className: "bg-black/5 text-brand-ink/60" },
};

interface OrderPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order) notFound();

  const status = STATUS_LABELS[order.status] ?? STATUS_LABELS.PENDING;

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-lg px-4 py-16 sm:px-6">
          <span
            className={`inline-flex rounded-full px-4 py-1 text-sm font-bold ${status.className}`}
          >
            {status.label}
          </span>

          <h1 className="mt-4 font-heading text-2xl font-semibold text-brand-ink">
            Pedido #{order.id.slice(-8)}
          </h1>
          <p className="text-sm text-brand-ink/60">{order.customerEmail}</p>

          <div className="mt-6 space-y-3 rounded-2xl bg-white p-5 shadow-sm">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-sm">
                <span className="font-semibold text-brand-ink">{item.product.title}</span>
                <span className="text-brand-ink/70">{formatPriceCents(item.unitPriceCents)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-black/5 pt-3 font-bold text-brand-ink">
              <span>Total</span>
              <span>{formatPriceCents(order.totalCents)}</span>
            </div>
          </div>

          {order.status === "PENDING" && (
            <div className="mt-6 rounded-2xl border border-dashed border-brand-turquoise/40 bg-brand-turquoise/5 p-5">
              <p className="text-sm text-brand-ink/70">
                Esse é um checkout fictício — ainda não há Stripe/Mercado Pago
                conectado. O botão abaixo simula o webhook que um provedor
                real enviaria ao confirmar o pagamento.
              </p>
              <form action="/api/webhooks/manual" method="post" className="mt-4">
                <input type="hidden" name="orderId" value={order.id} />
                <button
                  type="submit"
                  className="w-full rounded-full bg-brand-pink px-6 py-3 text-sm font-bold text-white transition hover:brightness-105"
                >
                  Simular pagamento aprovado
                </button>
              </form>
            </div>
          )}

          {order.status === "PAID" && (
            <div className="mt-6 rounded-2xl bg-green-50 p-5 text-sm text-green-800">
              <p>
                Pagamento confirmado! O acesso foi liberado para{" "}
                <strong>{order.customerEmail}</strong>.
              </p>
              <Link
                href="/meus-materiais"
                className="mt-3 inline-block font-bold text-green-900 underline"
              >
                Ver meus materiais →
              </Link>
            </div>
          )}

          <Link
            href="/catalogo"
            className="mt-8 inline-block text-sm font-bold text-brand-pink"
          >
            ← Voltar para o catálogo
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
