import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { CATEGORIES } from "../src/lib/categories";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const STAGE_MAP = {
  "Educação Infantil": "EDUCACAO_INFANTIL",
  "Ensino Fundamental 1": "FUNDAMENTAL_1",
} as const;

const COLOR_MAP = {
  yellow: "YELLOW",
  orange: "ORANGE",
  turquoise: "TURQUOISE",
  pink: "PINK",
} as const;

const SUBJECTS = [
  { slug: "alfabetizacao", name: "Alfabetização" },
  { slug: "matematica", name: "Matemática" },
  { slug: "interpretacao-de-texto", name: "Interpretação de texto" },
  { slug: "producao-de-texto", name: "Produção de texto" },
  { slug: "ciencias", name: "Ciências" },
  { slug: "coordenacao-motora", name: "Coordenação motora" },
  { slug: "datas-comemorativas", name: "Datas comemorativas" },
  { slug: "educacao-especial", name: "Educação especial" },
  { slug: "decoracao-de-sala", name: "Decoração de sala" },
  { slug: "material-do-professor", name: "Material do professor" },
];

async function main() {
  for (const [index, category] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        label: category.label,
        shortLabel: category.shortLabel,
        stage: STAGE_MAP[category.stage],
        color: COLOR_MAP[category.color],
        sortOrder: index,
      },
      create: {
        slug: category.slug,
        label: category.label,
        shortLabel: category.shortLabel,
        stage: STAGE_MAP[category.stage],
        color: COLOR_MAP[category.color],
        sortOrder: index,
      },
    });
  }

  for (const [index, subject] of SUBJECTS.entries()) {
    await prisma.subject.upsert({
      where: { slug: subject.slug },
      update: { name: subject.name, sortOrder: index },
      create: { slug: subject.slug, name: subject.name, sortOrder: index },
    });
  }

  console.log(
    `Seed concluído: ${CATEGORIES.length} categorias e ${SUBJECTS.length} matérias.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
