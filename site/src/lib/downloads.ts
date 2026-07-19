import { randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";

export type DownloadResult =
  | { ok: true; url: string }
  | { ok: false; reason: "no-access" | "not-synced" };

/**
 * Confere se o usuário tem direito ao arquivo (via Entitlement) e, se sim,
 * registra o download e devolve a URL do Vercel Blob — que nunca é exposta
 * na página, só através deste caminho controlado pelo servidor.
 */
export async function resolveDownload(userId: string, fileId: string): Promise<DownloadResult> {
  const file = await prisma.productFile.findUnique({
    where: { id: fileId },
    include: { product: true },
  });

  if (!file) return { ok: false, reason: "no-access" };

  const entitlement = await prisma.entitlement.findUnique({
    where: { userId_productId: { userId, productId: file.productId } },
  });

  if (!entitlement) return { ok: false, reason: "no-access" };
  if (entitlement.expiresAt && entitlement.expiresAt < new Date()) {
    return { ok: false, reason: "no-access" };
  }
  if (entitlement.maxDownloads !== null && entitlement.downloadCount >= entitlement.maxDownloads) {
    return { ok: false, reason: "no-access" };
  }

  if (!file.blobKey) return { ok: false, reason: "not-synced" };

  await prisma.$transaction([
    prisma.entitlement.update({
      where: { id: entitlement.id },
      data: { downloadCount: { increment: 1 } },
    }),
    prisma.downloadEvent.create({
      data: {
        entitlementId: entitlement.id,
        token: randomBytes(16).toString("hex"),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        downloadedAt: new Date(),
      },
    }),
  ]);

  return { ok: true, url: file.blobKey };
}

export async function listMyMaterials(userId: string) {
  return prisma.entitlement.findMany({
    where: { userId },
    include: {
      product: { include: { files: true, category: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}
