import Link from "next/link";
import { requireAdminUser } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdminUser();

  return (
    <div className="min-h-screen bg-brand-ink/[0.03]">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/admin" className="font-heading text-lg font-semibold text-brand-ink">
            lum<span className="text-brand-pink">educação</span>{" "}
            <span className="text-brand-ink/40">/ admin</span>
          </Link>
          <nav className="flex items-center gap-5 text-sm font-semibold text-brand-ink/70">
            <Link href="/admin" className="hover:text-brand-pink">
              Visão geral
            </Link>
            <Link href="/admin/produtos" className="hover:text-brand-pink">
              Produtos
            </Link>
            <Link href="/admin/pedidos" className="hover:text-brand-pink">
              Pedidos
            </Link>
            <span className="text-brand-ink/40">{user.email}</span>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="hover:text-brand-pink">
                Sair
              </button>
            </form>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
