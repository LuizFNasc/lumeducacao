/**
 * Lê a árvore de materiais (pasta `lumeducacao/` na raiz do repositório,
 * espelho do Google Drive), infere produto/categoria/matéria por pasta e
 * arquivo, e grava um relatório em JSON. Com DATABASE_URL configurada,
 * também faz upsert dos registros no banco (sempre como status DRAFT —
 * a publicação é manual, no painel admin).
 *
 * Uso:
 *   npx tsx scripts/import-catalog.ts            # gera apenas o relatório JSON
 *   npx tsx scripts/import-catalog.ts --write     # também grava no banco
 */
import { readdirSync, statSync, mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const MATERIALS_ROOT = path.resolve(__dirname, "../../lumeducacao");
const REPORT_PATH = path.resolve(__dirname, "../data/catalog-import-report.json");
const SHOULD_WRITE = process.argv.includes("--write");

// ---------- normalização ----------

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

function slugify(value: string): string {
  return normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toTitle(name: string): string {
  const isShouting = name === name.toUpperCase() && /[A-ZÀ-Ú]/.test(name);
  if (!isShouting) return name.trim();
  const lowercaseWords = new Set(["de", "da", "do", "das", "dos", "e", "em", "a", "o"]);
  return name
    .toLowerCase()
    .split(" ")
    .map((word, index) =>
      index > 0 && lowercaseWords.has(word)
        ? word
        : word.charAt(0).toUpperCase() + word.slice(1),
    )
    .join(" ")
    .trim();
}

// ---------- limite de pasta "componente" (não é um produto novo) ----------

const COMPONENT_FOLDER_NAMES = new Set([
  "pdf",
  "pdfs",
  "foto",
  "fotos",
  "imagem",
  "imagens",
  "video",
  "videos",
  "copy",
  "kit",
  "descricao",
  "arquivo",
  "arquivos",
  "autorizacao",
  "autorizacao revenda",
  "autorizacao de revenda",
  "link de edicao",
  "link para edicao",
  "link editavel",
  "link edicao",
  "link",
  "png",
  "jpg",
  "jpeg",
]);

function isComponentFolder(name: string): boolean {
  return COMPONENT_FOLDER_NAMES.has(normalize(name));
}

// ---------- tipo de arquivo ----------

type FileKind = "PDF" | "EDITABLE" | "IMAGE" | "VIDEO" | "OTHER";

const EXT_KIND: Record<string, FileKind> = {
  ".pdf": "PDF",
  ".docx": "EDITABLE",
  ".doc": "EDITABLE",
  ".png": "IMAGE",
  ".jpg": "IMAGE",
  ".jpeg": "IMAGE",
  ".heic": "IMAGE",
  ".mp4": "VIDEO",
  ".mov": "VIDEO",
};

function fileKind(fileName: string): FileKind {
  return EXT_KIND[path.extname(fileName).toLowerCase()] ?? "OTHER";
}

// ---------- categorias (série) ----------

const CATEGORY_RULES: { slug: string; test: RegExp }[] = [
  { slug: "pre-2", test: /\bpre\s*-?\s*ii\b|\bpre\s*-?\s*2\b/ },
  { slug: "pre-1", test: /\bpre\s*-?\s*i\b|\bpre\s*-?\s*1\b/ },
  { slug: "1-ano", test: /\b1[oa°º]?\s*ano\b|\bprimeiro\s*ano\b/ },
  { slug: "2-ano", test: /\b2[oa°º]?\s*ano\b|\bsegundo\s*ano\b/ },
  { slug: "3-ano", test: /\b3[oa°º]?\s*ano\b|\bterceiro\s*ano\b/ },
  { slug: "4-ano", test: /\b4[oa°º]?\s*ano\b|\bquarto\s*ano\b/ },
  { slug: "5-ano", test: /\b5[oa°º]?\s*ano\b|\bquinto\s*ano\b/ },
];

function matchCategories(searchText: string): string[] {
  const normalized = normalize(searchText).replace(/[°º]/g, " ");
  const matches = new Set<string>();
  for (const rule of CATEGORY_RULES) {
    if (rule.test.test(normalized)) matches.add(rule.slug);
  }
  return Array.from(matches);
}

// ---------- matérias/temas ----------

const SUBJECT_RULES: { slug: string; keywords: string[] }[] = [
  {
    slug: "matematica",
    keywords: ["matemátic", "multiplica", "divisão", "divisao", "numeros", "números", "material dourado", "tabuada"],
  },
  {
    slug: "alfabetizacao",
    keywords: ["alfabeto", "alfabetiza", "vogais", "vogal", "letrin", "palavrinhas"],
  },
  {
    slug: "interpretacao-de-texto",
    keywords: ["interpretação de texto", "interpretacao de texto", "leitura"],
  },
  {
    slug: "producao-de-texto",
    keywords: ["produção de texto", "producao de texto", "produção textual"],
  },
  {
    slug: "ciencias",
    keywords: ["ciências", "ciencias", "planta", "natureza", "animais", "dinossauro"],
  },
  {
    slug: "educacao-especial",
    keywords: ["educação especial", "educacao especial", "autis", "adaptad", "inclus"],
  },
  {
    slug: "decoracao-de-sala",
    keywords: [
      "painel", "capa de caderno", "capas de caderno", "kit sala", "cantinho",
      "bolsinho", "caixinha", "caixa das", "caixa musical", "luva", "sacola",
      "decoraç", "decoraca", "porta", "volta as aulas", "volta às aulas", "rotina",
    ],
  },
  {
    slug: "material-do-professor",
    keywords: ["crachá", "cracha", "relatório", "relatorio", "planner", "coordenaç", "coordenac", "professor"],
  },
  {
    slug: "datas-comemorativas",
    keywords: ["datas comemorativas", "natal", "páscoa", "pascoa", "festa junina"],
  },
];

function matchSubjects(searchText: string): string[] {
  const normalized = normalize(searchText);
  const matches = new Set<string>();
  for (const rule of SUBJECT_RULES) {
    if (rule.keywords.some((kw) => normalized.includes(normalize(kw)))) {
      matches.add(rule.slug);
    }
  }
  return Array.from(matches);
}

// ---------- varredura da árvore ----------

interface DiscoveredFile {
  relativePath: string;
  fileName: string;
  kind: FileKind;
}

interface DiscoveredProduct {
  title: string;
  slug: string;
  relativeFolderPath: string;
  files: DiscoveredFile[];
  matchedCategories: string[];
  matchedSubjects: string[];
}

const products: DiscoveredProduct[] = [];
const usedSlugs = new Map<string, number>();

function uniqueSlug(base: string): string {
  const count = usedSlugs.get(base) ?? 0;
  usedSlugs.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function collectFilesRecursively(dir: string, root: string): DiscoveredFile[] {
  const files: DiscoveredFile[] = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".")) continue;
    const fullPath = path.join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...collectFilesRecursively(fullPath, root));
    } else {
      files.push({
        relativePath: path.relative(root, fullPath),
        fileName: entry,
        kind: fileKind(entry),
      });
    }
  }
  return files;
}

function walk(dir: string, root: string) {
  const entries = readdirSync(dir, { withFileTypes: true }).filter(
    (entry) => !entry.name.startsWith("."),
  );
  const dirEntries = entries.filter((entry) => entry.isDirectory());
  const fileEntries = entries.filter((entry) => entry.isFile());

  const isProductBoundary =
    fileEntries.length > 0 ||
    (dirEntries.length > 0 && dirEntries.every((entry) => isComponentFolder(entry.name)));

  if (isProductBoundary) {
    const files = collectFilesRecursively(dir, dir);
    if (files.length === 0) return;

    const folderName = path.basename(dir);
    const title = toTitle(folderName);
    const relativeFolderPath = path.relative(root, dir);
    const searchText = `${relativeFolderPath} ${files.map((f) => f.fileName).join(" ")}`;

    products.push({
      title,
      slug: uniqueSlug(slugify(title) || slugify(relativeFolderPath)),
      relativeFolderPath,
      files: files.map((f) => ({
        ...f,
        relativePath: path.join(relativeFolderPath, f.relativePath),
      })),
      matchedCategories: matchCategories(searchText),
      matchedSubjects: matchSubjects(searchText),
    });
    return;
  }

  for (const entry of dirEntries) {
    walk(path.join(dir, entry.name), root);
  }
}

walk(MATERIALS_ROOT, MATERIALS_ROOT);

// ---------- relatório ----------

const summary = {
  generatedAt: new Date().toISOString(),
  materialsRoot: MATERIALS_ROOT,
  totalProducts: products.length,
  totalFiles: products.reduce((sum, p) => sum + p.files.length, 0),
  withCategory: products.filter((p) => p.matchedCategories.length > 0).length,
  withoutCategory: products.filter((p) => p.matchedCategories.length === 0).length,
  categoryCounts: Object.fromEntries(
    CATEGORY_RULES.map((rule) => [
      rule.slug,
      products.filter((p) => p.matchedCategories.includes(rule.slug)).length,
    ]),
  ),
  subjectCounts: Object.fromEntries(
    SUBJECT_RULES.map((rule) => [
      rule.slug,
      products.filter((p) => p.matchedSubjects.includes(rule.slug)).length,
    ]),
  ),
};

mkdirSync(path.dirname(REPORT_PATH), { recursive: true });
writeFileSync(REPORT_PATH, JSON.stringify({ summary, products }, null, 2), "utf-8");

console.log(`Produtos encontrados: ${summary.totalProducts}`);
console.log(`Arquivos encontrados: ${summary.totalFiles}`);
console.log(`Com série identificada: ${summary.withCategory}`);
console.log(`Sem série identificada (revisão manual): ${summary.withoutCategory}`);
console.log(`Relatório salvo em: ${path.relative(process.cwd(), REPORT_PATH)}`);

// ---------- gravação no banco (opcional) ----------

async function writeToDatabase() {
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("../src/generated/prisma/client");

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const categories = await prisma.category.findMany();
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c.id]));
  const subjects = await prisma.subject.findMany();
  const subjectBySlug = new Map(subjects.map((s) => [s.slug, s.id]));

  const DEFAULT_PRICE_CENTS = 1990;

  let created = 0;
  let updated = 0;

  for (const product of products) {
    const primaryCategorySlug = product.matchedCategories[0];
    const alternateCategories = product.matchedCategories.slice(1);
    const notes = alternateCategories.length
      ? `Também pode se aplicar a: ${alternateCategories.join(", ")}. Preço é um placeholder — revisar antes de publicar.`
      : "Preço é um placeholder — revisar categoria/preço antes de publicar.";

    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });

    const baseData = {
      title: product.title,
      description: `Material importado automaticamente de "${product.relativeFolderPath}". Revisar descrição antes de publicar.`,
      categoryId: primaryCategorySlug ? categoryBySlug.get(primaryCategorySlug) : undefined,
      priceCents: DEFAULT_PRICE_CENTS,
      sourceRepoPath: product.relativeFolderPath,
      importNotes: notes,
      status: "DRAFT" as const,
    };

    const subjectCreates = product.matchedSubjects
      .map((slug) => subjectBySlug.get(slug))
      .filter((id): id is string => Boolean(id))
      .map((subjectId) => ({ subjectId }));

    const fileCreates = product.files.map((file) => ({
      kind: file.kind,
      fileName: file.fileName,
      sourcePath: file.relativePath,
      driveFileId: null,
    }));

    if (existing) {
      await prisma.productFile.deleteMany({ where: { productId: existing.id } });
      await prisma.productSubject.deleteMany({ where: { productId: existing.id } });
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          ...baseData,
          subjects: { create: subjectCreates },
          files: { create: fileCreates },
        },
      });
      updated += 1;
    } else {
      await prisma.product.create({
        data: {
          slug: product.slug,
          ...baseData,
          subjects: { create: subjectCreates },
          files: { create: fileCreates },
        },
      });
      created += 1;
    }
  }

  console.log(`Banco atualizado: ${created} produtos criados, ${updated} atualizados.`);
  await prisma.$disconnect();
}

if (SHOULD_WRITE) {
  writeToDatabase().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
