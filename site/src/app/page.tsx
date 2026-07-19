import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CategoryCard } from "@/components/CategoryCard";
import { CATEGORIES } from "@/lib/categories";

export default function Home() {
  const infantil = CATEGORIES.filter((c) => c.stage === "Educação Infantil");
  const fundamental = CATEGORIES.filter(
    (c) => c.stage === "Ensino Fundamental 1",
  );

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand-yellow/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-72 w-72 rounded-full bg-brand-turquoise/30 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-brand-turquoise/15 px-4 py-1 text-sm font-bold text-brand-ink">
                ✏️ Para professores e pais
              </span>
              <h1 className="mt-6 font-heading text-4xl font-semibold leading-tight text-brand-ink sm:text-5xl">
                Atividades pedagógicas prontas para{" "}
                <span className="text-brand-pink">imprimir e usar</span>
              </h1>
              <p className="mt-5 text-lg text-brand-ink/70">
                Materiais digitais da Educação Infantil ao 5º ano do
                Fundamental. Compre, baixe e leve a diversão de aprender para
                a sala de aula ou para casa.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="/catalogo"
                  className="rounded-full bg-brand-pink px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
                >
                  Explorar catálogo
                </Link>
                <Link
                  href="/#categorias"
                  className="rounded-full border-2 border-brand-ink/10 px-6 py-3 text-sm font-bold text-brand-ink transition hover:border-brand-turquoise"
                >
                  Ver por série
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="categorias" className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <div className="mb-8">
            <h2 className="font-heading text-2xl font-semibold text-brand-ink sm:text-3xl">
              Educação Infantil
            </h2>
            <p className="mt-1 text-brand-ink/70">
              Atividades lúdicas para os primeiros passos da aprendizagem.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {infantil.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>

          <div className="mt-16 mb-8">
            <h2 className="font-heading text-2xl font-semibold text-brand-ink sm:text-3xl">
              Ensino Fundamental 1
            </h2>
            <p className="mt-1 text-brand-ink/70">
              Do 1º ao 5º ano, com atividades por série e por matéria.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {fundamental.map((category) => (
              <CategoryCard key={category.slug} category={category} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
