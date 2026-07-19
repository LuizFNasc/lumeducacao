export type CategorySlug =
  | "pre-1"
  | "pre-2"
  | "1-ano"
  | "2-ano"
  | "3-ano"
  | "4-ano"
  | "5-ano";

export interface Category {
  slug: CategorySlug;
  label: string;
  shortLabel: string;
  stage: "Educação Infantil" | "Ensino Fundamental 1";
  description: string;
  color: "yellow" | "orange" | "turquoise" | "pink";
}

export const CATEGORIES: Category[] = [
  {
    slug: "pre-1",
    label: "Educação Infantil – Pré I (3-4 anos)",
    shortLabel: "Pré I",
    stage: "Educação Infantil",
    description: "Atividades de coordenação motora, cores, formas e primeiras descobertas.",
    color: "pink",
  },
  {
    slug: "pre-2",
    label: "Educação Infantil – Pré II (5 anos)",
    shortLabel: "Pré II",
    stage: "Educação Infantil",
    description: "Preparação para a alfabetização, letras, números e autonomia.",
    color: "orange",
  },
  {
    slug: "1-ano",
    label: "Ensino Fundamental 1 – 1º ano",
    shortLabel: "1º ano",
    stage: "Ensino Fundamental 1",
    description: "Alfabetização, números iniciais e primeiras produções de texto.",
    color: "yellow",
  },
  {
    slug: "2-ano",
    label: "Ensino Fundamental 1 – 2º ano",
    shortLabel: "2º ano",
    stage: "Ensino Fundamental 1",
    description: "Consolidação da leitura, escrita e operações matemáticas básicas.",
    color: "turquoise",
  },
  {
    slug: "3-ano",
    label: "Ensino Fundamental 1 – 3º ano",
    shortLabel: "3º ano",
    stage: "Ensino Fundamental 1",
    description: "Interpretação de texto, multiplicação, divisão e ciências.",
    color: "pink",
  },
  {
    slug: "4-ano",
    label: "Ensino Fundamental 1 – 4º ano",
    shortLabel: "4º ano",
    stage: "Ensino Fundamental 1",
    description: "Produção textual, frações e aprofundamento em ciências.",
    color: "orange",
  },
  {
    slug: "5-ano",
    label: "Ensino Fundamental 1 – 5º ano",
    shortLabel: "5º ano",
    stage: "Ensino Fundamental 1",
    description: "Preparação para o 6º ano com conteúdos mais avançados.",
    color: "yellow",
  },
];
