import type { Metadata } from "next";
import Link from "next/link";
import { listAllProductsForAdmin } from "@/lib/products";
import { formatPriceCents } from "@/lib/format";

export const metadata: Metadata = { title: "Produtos | Admin Lumeducação" };

const STATUS_LABELS: Record<string, { label: string; className: string }> = {
  DRAFT: { label: "Rascunho", className: "bg-brand-yellow/25 text-brand-ink" },
  PUBLISHED: { label: "Publicado", className: "bg-green-100 text-green-800" },
  ARCHIVED: { label: "Arquivado", className: "bg-black/10 text-brand-ink/60" },
};

interface AdminProdutosPageProps {
  searchParams: Promise<{ status?: string; q?: string }>;
}

export default async function AdminProdutosPage({ searchParams }: AdminProdutosPageProps) {
  const { status, q } = await searchParams;
  const validStatus =
    status === "DRAFT" || status === "PUBLISHED" || status === "ARCHIVED" ? status : undefined;

  const products = await listAllProductsForAdmin({ status: validStatus, query: q });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold text-brand-ink">
          Produtos ({products.length})
        </h1>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <form action="/admin/produtos" method="get" className="flex gap-2">
          {validStatus && <input type="hidden" name="status" value={validStatus} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar por título..."
            className="rounded-full border border-black/10 px-4 py-2 text-sm focus:border-brand-turquoise focus:outline-none"
          />
        </form>
        <div className="flex gap-2 text-sm font-semibold">
          {[
            { label: "Todos", value: undefined },
            { label: "Rascunho", value: "DRAFT" },
            { label: "Publicado", value: "PUBLISHED" },
            { label: "Arquivado", value: "ARCHIVED" },
          ].map((option) => (
            <Link
              key={option.label}
              href={
                option.value
                  ? `/admin/produtos?status=${option.value}${q ? `&q=${q}` : ""}`
                  : `/admin/produtos${q ? `?q=${q}` : ""}`
              }
              className={`rounded-full border px-3 py-1.5 ${
                validStatus === option.value
                  ? "border-brand-pink bg-brand-pink text-white"
                  : "border-black/10 text-brand-ink/70"
              }`}
            >
              {option.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-ink/5 text-xs font-bold uppercase tracking-wide text-brand-ink/60">
            <tr>
              <th className="px-5 py-3">Título</th>
              <th className="px-5 py-3">Série</th>
              <th className="px-5 py-3">Preço</th>
              <th className="px-5 py-3">Arquivos</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const statusInfo = STATUS_LABELS[product.status];
              return (
                <tr key={product.id} className="border-t border-black/5">
                  <td className="px-5 py-3 font-semibold text-brand-ink">{product.title}</td>
                  <td className="px-5 py-3 text-brand-ink/70">
                    {product.category?.shortLabel ?? "—"}
                  </td>
                  <td className="px-5 py-3">{formatPriceCents(product.priceCents)}</td>
                  <td className="px-5 py-3 text-brand-ink/70">{product._count.files}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/produtos/${product.id}`} className="font-bold text-brand-pink">
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
