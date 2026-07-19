import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getSessionUser } from "@/lib/auth";
import { listMyMaterials } from "@/lib/downloads";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Meus materiais | Lumeducação",
};

const FILE_KIND_LABELS: Record<string, string> = {
  PDF: "PDF",
  EDITABLE: "Editável",
  IMAGE: "Imagem",
  VIDEO: "Vídeo",
  OTHER: "Arquivo",
};

export default async function MeusMateriaisPage() {
  const user = await getSessionUser();
  if (!user) redirect("/entrar");

  const entitlements = await listMyMaterials(user.id);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-semibold text-brand-ink">
                Meus materiais
              </h1>
              <p className="mt-1 text-sm text-brand-ink/70">{user.email}</p>
            </div>
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="text-sm font-bold text-brand-pink">
                Sair
              </button>
            </form>
          </div>

          {entitlements.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-black/10 bg-white p-12 text-center">
              <p className="font-heading text-xl text-brand-ink">
                Você ainda não tem materiais liberados
              </p>
              <p className="mt-2 text-brand-ink/70">
                Depois de finalizar uma compra, seus materiais aparecem aqui.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-4">
              {entitlements.map((entitlement) => (
                <div
                  key={entitlement.id}
                  className="rounded-2xl bg-white p-5 shadow-sm"
                >
                  <h2 className="font-heading text-lg font-semibold text-brand-ink">
                    {entitlement.product.title}
                  </h2>
                  <ul className="mt-3 space-y-2">
                    {entitlement.product.files.map((file) => (
                      <li
                        key={file.id}
                        className="flex items-center justify-between rounded-xl bg-brand-ink/5 px-4 py-2 text-sm"
                      >
                        <span className="text-brand-ink/80">
                          {file.fileName}{" "}
                          <span className="text-xs text-brand-ink/50">
                            ({FILE_KIND_LABELS[file.kind] ?? file.kind})
                          </span>
                        </span>
                        <a
                          href={`/api/download/${file.id}`}
                          className="font-bold text-brand-pink hover:underline"
                        >
                          Baixar
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
