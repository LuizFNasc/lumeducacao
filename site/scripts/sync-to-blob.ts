/**
 * Sincroniza os arquivos já catalogados (ProductFile, gerados por
 * scripts/import-catalog.ts) para o Vercel Blob. A fonte hoje é a cópia
 * local em `lumeducacao/` (o mesmo conteúdo do Google Drive, já espelhado
 * no repositório) — ver src/lib/google-drive.ts para o cliente de leitura
 * do Drive, pronto para quando/​se ele passar a ser a fonte direta.
 *
 * Nunca torna os arquivos publicamente descobríveis: o Blob é criado com
 * sufixo aleatório e a URL só é revelada ao comprador através de uma rota
 * de download autenticada (etapas 6/7), nunca diretamente no client.
 *
 * Uso:
 *   npx tsx scripts/sync-to-blob.ts                # dry-run (não sobe nada)
 *   npx tsx scripts/sync-to-blob.ts --write         # sobe para o Vercel Blob
 *   npx tsx scripts/sync-to-blob.ts --write --force # resssincroniza mesmo sem mudança
 */
import { createHash } from "node:crypto";
import { createReadStream, existsSync, statSync } from "node:fs";
import path from "node:path";

const MATERIALS_ROOT = path.resolve(__dirname, "../../lumeducacao");
const SHOULD_WRITE = process.argv.includes("--write");
const FORCE = process.argv.includes("--force");

const MIME_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".doc": "application/msword",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".heic": "image/heic",
  ".mp4": "video/mp4",
  ".mov": "video/quicktime",
};

function mimeTypeFor(fileName: string): string {
  return MIME_TYPES[path.extname(fileName).toLowerCase()] ?? "application/octet-stream";
}

function sha256OfFile(absolutePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(absolutePath);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
}

async function main() {
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { PrismaClient } = await import("../src/generated/prisma/client");

  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  const prisma = new PrismaClient({ adapter });

  const products = await prisma.product.findMany({
    include: { files: true },
    orderBy: { title: "asc" },
  });

  let put: typeof import("@vercel/blob").put | undefined;
  if (SHOULD_WRITE) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error(
        "BLOB_READ_WRITE_TOKEN não configurada. Crie um Vercel Blob store e defina a variável antes de rodar com --write.",
      );
    }
    ({ put } = await import("@vercel/blob"));
  }

  let alreadySynced = 0;
  let uploaded = 0;
  let wouldUpload = 0;
  let missing = 0;
  let failed = 0;
  let totalBytes = 0;

  for (const product of products) {
    for (const file of product.files) {
      if (!file.sourcePath) {
        console.warn(`⚠ sem sourcePath: ${product.title} / ${file.fileName}`);
        continue;
      }

      const absolutePath = path.join(MATERIALS_ROOT, file.sourcePath);
      if (!existsSync(absolutePath)) {
        console.warn(`✗ arquivo não encontrado no disco: ${file.sourcePath}`);
        missing += 1;
        continue;
      }

      const { size } = statSync(absolutePath);
      const checksum = await sha256OfFile(absolutePath);
      totalBytes += size;

      const upToDate = !FORCE && file.blobKey && file.checksum === checksum;
      if (upToDate) {
        alreadySynced += 1;
        continue;
      }

      if (!SHOULD_WRITE) {
        console.log(
          `[dry-run] enviaria: ${product.slug}/${file.fileName} (${(size / 1024).toFixed(0)} KB)`,
        );
        wouldUpload += 1;
        continue;
      }

      try {
        const blob = await put!(`products/${product.slug}/${file.fileName}`, createReadStream(absolutePath), {
          access: "public",
          addRandomSuffix: true,
          token: process.env.BLOB_READ_WRITE_TOKEN,
          contentType: mimeTypeFor(file.fileName),
        });

        await prisma.productFile.update({
          where: { id: file.id },
          data: {
            blobKey: blob.url,
            checksum,
            sizeBytes: BigInt(size),
            mimeType: mimeTypeFor(file.fileName),
          },
        });

        uploaded += 1;
      } catch (error) {
        console.error(`✗ falha ao enviar ${file.sourcePath}:`, error);
        failed += 1;
      }
    }
  }

  console.log("---");
  console.log(`Já sincronizados (sem mudança): ${alreadySynced}`);
  console.log(`${SHOULD_WRITE ? "Enviados agora" : "Seriam enviados (dry-run)"}: ${SHOULD_WRITE ? uploaded : wouldUpload}`);
  console.log(`Não encontrados no disco: ${missing}`);
  console.log(`Falhas: ${failed}`);
  console.log(`Volume total considerado: ${(totalBytes / 1024 / 1024).toFixed(1)} MB`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
