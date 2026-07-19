import Link from "next/link";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export async function Header() {
  // Checa só a presença do cookie (sem consulta ao banco) para não obrigar
  // toda página que usa o Header a depender de DATABASE_URL — a validação
  // de verdade da sessão acontece em /meus-materiais.
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has(SESSION_COOKIE_NAME);

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-brand-turquoise text-lg">
            📚
          </span>
          <span className="font-heading text-xl font-semibold text-brand-ink">
            lum<span className="text-brand-pink">educação</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-semibold text-brand-ink/80 sm:flex">
          <Link href="/catalogo" className="hover:text-brand-pink">
            Catálogo
          </Link>
          <Link href="/#categorias" className="hover:text-brand-pink">
            Séries
          </Link>
          <Link href="/meus-materiais" className="hover:text-brand-pink">
            Meus materiais
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!isLoggedIn && (
            <Link
              href="/entrar"
              className="hidden text-sm font-bold text-brand-ink/80 hover:text-brand-pink sm:block"
            >
              Entrar
            </Link>
          )}
          <Link
            href="/catalogo"
            className="rounded-full bg-brand-pink px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
          >
            Ver atividades
          </Link>
        </div>
      </div>
    </header>
  );
}
