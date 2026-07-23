import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatPriceCents } from "@/lib/format";

export const metadata: Metadata = { title: "Pedidos | Admin Lumeducação" };

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pendente", className: "bg-brand-yellow/25 text-brand-ink" },
  PAID: { label: "Pago", className: "bg-green-100 text-green-800" },
  FAILED: { label: "Falhou", className: "bg-red-100 text-red-700" },
  CANCELED: { label: "Cancelado", className: "bg-black/10 text-brand-ink/60" },
  REFUNDED: { label: "Reembolsado", className: "bg-black/10 text-brand-ink/60" },
};

export default async function AdminPedidosPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: { include: { product: true } } },
  });

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-brand-ink">
        Pedidos ({orders.length})
      </h1>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-ink/5 text-xs font-bold uppercase tracking-wide text-brand-ink/60">
            <tr>
              <th className="px-5 py-3">Data</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Materiais</th>
              <th className="px-5 py-3">Provedor</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-brand-ink/50">
                  Nenhum pedido ainda.
                </td>
              </tr>
            )}
            {orders.map((order) => {
              const statusInfo = STATUS_LABELS[order.status];
              return (
                <tr key={order.id} className="border-t border-black/5">
                  <td className="px-5 py-3 text-brand-ink/70">
                    {order.createdAt.toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-5 py-3">{order.customerEmail}</td>
                  <td className="px-5 py-3 text-brand-ink/70">
                    {order.items.map((item) => item.product.title).join(", ")}
                  </td>
                  <td className="px-5 py-3 text-brand-ink/70">{order.provider}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-semibold">{formatPriceCents(order.totalCents)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
