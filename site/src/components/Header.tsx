import Link from "next/link";

export function Header() {
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
          <Link href="/minha-conta" className="hover:text-brand-pink">
            Meus materiais
          </Link>
        </nav>

        <Link
          href="/catalogo"
          className="rounded-full bg-brand-pink px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
        >
          Ver atividades
        </Link>
      </div>
    </header>
  );
}
