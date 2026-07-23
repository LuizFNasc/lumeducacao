import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategories, getProductByIdForAdmin } from "@/lib/products";

export const metadata: Metadata = { title: "Editar produto | Admin Lumeducação" };

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories] = await Promise.all([
    getProductByIdForAdmin(id),
    getCategories(),
  ]);

  if (!product) notFound();

  const priceReais = (product.priceCents / 100).toFixed(2);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/admin/produtos" className="text-sm font-bold text-brand-pink">
        ← Voltar
      </Link>
      <h1 className="mt-2 font-heading text-2xl font-semibold text-brand-ink">
        {product.title}
      </h1>
      <p className="mt-1 text-sm text-brand-ink/50">
        Origem: {product.sourceRepoPath ?? "—"}
      </p>
      {product.importNotes && (
        <p className="mt-2 rounded-xl bg-brand-yellow/15 px-4 py-3 text-sm text-brand-ink/80">
          {product.importNotes}
        </p>
      )}

      <form
        action={`/api/admin/produtos/${product.id}`}
        method="post"
        className="mt-6 space-y-5 rounded-2xl bg-white p-6 shadow-sm"
      >
        <div>
          <label htmlFor="title" className="text-sm font-semibold text-brand-ink">
            Título
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={product.title}
            className="mt-1 w-full rounded-xl border border-black/10 px-4 py-2 text-sm focus:border-brand-turquoise focus:outline-none"
          />
        </div>

        <div>
          <label htmlFor="description" className="text-sm font-semibold text-brand-ink">
            Descrição
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product.description}
            className="mt-1 w-full rounded-xl border border-black/10 px-4 py-2 text-sm focus:border-brand-turquoise focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="priceReais" className="text-sm font-semibold text-brand-ink">
              Preço (R$)
            </label>
            <input
              id="priceReais"
              name="priceReais"
              type="number"
              step="0.01"
              min="0"
              required
              defaultValue={priceReais}
              className="mt-1 w-full rounded-xl border border-black/10 px-4 py-2 text-sm focus:border-brand-turquoise focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="status" className="text-sm font-semibold text-brand-ink">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={product.status}
              className="mt-1 w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm focus:border-brand-turquoise focus:outline-none"
            >
              <option value="DRAFT">Rascunho</option>
              <option value="PUBLISHED">Publicado</option>
              <option value="ARCHIVED">Arquivado</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="categoryId" className="text-sm font-semibold text-brand-ink">
            Série
          </label>
          <select
            id="categoryId"
            name="categoryId"
            defaultValue={product.categoryId ?? ""}
            className="mt-1 w-full rounded-xl border border-black/10 bg-white px-4 py-2 text-sm focus:border-brand-turquoise focus:outline-none"
          >
            <option value="">Sem série definida</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="coverImageUrl" className="text-sm font-semibold text-brand-ink">
            URL da imagem de capa
          </label>
          <input
            id="coverImageUrl"
            name="coverImageUrl"
            type="url"
            defaultValue={product.coverImageUrl ?? ""}
            placeholder="https://..."
            className="mt-1 w-full rounded-xl border border-black/10 px-4 py-2 text-sm focus:border-brand-turquoise focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-brand-pink px-6 py-3 text-sm font-bold text-white transition hover:brightness-105"
        >
          Salvar alterações
        </button>
      </form>

      <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <p className="font-heading text-sm font-semibold text-brand-ink">
          Arquivos ({product.files.length})
        </p>
        <ul className="mt-3 space-y-1 text-sm text-brand-ink/70">
          {product.files.map((file) => (
            <li key={file.id} className="flex items-center justify-between">
              <span>{file.fileName}</span>
              <span className={file.blobKey ? "text-green-700" : "text-brand-ink/40"}>
                {file.blobKey ? "sincronizado" : "pendente"}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
