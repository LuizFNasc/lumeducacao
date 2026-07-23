import type { Metadata } from "next";
import Link from "next/link";
import { getDashboardStats } from "@/lib/admin";
import { formatPriceCents } from "@/lib/format";

export const metadata: Metadata = { title: "Admin | Lumeducação" };

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-brand-ink/60">{label}</p>
      <p className="mt-1 font-heading text-2xl font-semibold text-brand-ink">{value}</p>
    </div>
  );
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  FAILED: "Falhou",
  CANCELED: "Cancelado",
  REFUNDED: "Reembolsado",
};

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold text-brand-ink">Visão geral</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Receita confirmada" value={formatPriceCents(stats.revenueCents)} />
        <StatCard label="Pedidos pagos" value={String(stats.paidOrdersCount)} />
        <StatCard label="Acessos liberados" value={String(stats.entitlementCount)} />
        <StatCard label="Downloads realizados" value={String(stats.downloadCount)} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <StatCard label="Produtos publicados" value={String(stats.publishedProducts)} />
        <StatCard label="Rascunhos p/ revisar" value={String(stats.draftProducts)} />
        <StatCard label="Arquivados" value={String(stats.archivedProducts)} />
      </div>

      <div className="mt-10 flex items-center justify-between">
        <h2 className="font-heading text-lg font-semibold text-brand-ink">Pedidos recentes</h2>
        <Link href="/admin/pedidos" className="text-sm font-bold text-brand-pink">
          Ver todos →
        </Link>
      </div>
      <div className="mt-4 overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-ink/5 text-xs font-bold uppercase tracking-wide text-brand-ink/60">
            <tr>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Materiais</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-brand-ink/50">
                  Nenhum pedido ainda.
                </td>
              </tr>
            )}
            {stats.recentOrders.map((order) => (
              <tr key={order.id} className="border-t border-black/5">
                <td className="px-5 py-3">{order.customerEmail}</td>
                <td className="px-5 py-3 text-brand-ink/70">
                  {order.items.map((item) => item.product.title).join(", ")}
                </td>
                <td className="px-5 py-3">{ORDER_STATUS_LABELS[order.status] ?? order.status}</td>
                <td className="px-5 py-3 font-semibold">{formatPriceCents(order.totalCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
