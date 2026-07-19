import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Entrar | Lumeducação",
};

const ERROR_MESSAGES: Record<string, string> = {
  "email-invalido": "Digite um e-mail válido.",
  "link-invalido": "Link de login inválido.",
  "link-expirado": "Esse link expirou ou já foi usado. Peça um novo.",
};

interface EntrarPageProps {
  searchParams: Promise<{ erro?: string }>;
}

export default async function EntrarPage({ searchParams }: EntrarPageProps) {
  const { erro } = await searchParams;

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
          <h1 className="font-heading text-2xl font-semibold text-brand-ink">
            Entrar
          </h1>
          <p className="mt-2 text-sm text-brand-ink/70">
            Digite o e-mail usado na compra para acessar seus materiais. Vamos
            te enviar um link de acesso.
          </p>

          {erro && (
            <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {ERROR_MESSAGES[erro] ?? "Não foi possível continuar. Tente novamente."}
            </p>
          )}

          <form action="/api/auth/request-link" method="post" className="mt-6 space-y-4">
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
            </div>
            <button
              type="submit"
              className="w-full rounded-full bg-brand-pink px-6 py-3 text-sm font-bold text-white transition hover:brightness-105"
            >
              Enviar link de acesso
            </button>
          </form>
        </section>
      </main>
      <Footer />
    </>
  );
}
