import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Link enviado | Lumeducação",
};

interface LinkEnviadoPageProps {
  searchParams: Promise<{ email?: string; token?: string }>;
}

export default async function LinkEnviadoPage({ searchParams }: LinkEnviadoPageProps) {
  const { email, token } = await searchParams;

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-md px-4 py-16 sm:px-6">
          <h1 className="font-heading text-2xl font-semibold text-brand-ink">
            Verifique seu e-mail
          </h1>
          <p className="mt-2 text-sm text-brand-ink/70">
            Enviamos um link de acesso para <strong>{email}</strong>. O link
            expira em 15 minutos.
          </p>

          {token && (
            <div className="mt-6 rounded-2xl border border-dashed border-brand-turquoise/40 bg-brand-turquoise/5 p-5">
              <p className="text-sm text-brand-ink/70">
                Ambiente de teste — ainda não há um provedor de e-mail
                conectado, então o link aparece aqui em vez de chegar na sua
                caixa de entrada.
              </p>
              <a
                href={`/api/auth/verify?token=${token}`}
                className="mt-4 inline-block w-full rounded-full bg-brand-pink px-6 py-3 text-center text-sm font-bold text-white transition hover:brightness-105"
              >
                Acessar meus materiais
              </a>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
