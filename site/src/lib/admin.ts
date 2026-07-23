import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

/**
 * Restringe o acesso ao painel ao dono do site. Quem não está logado é
 * mandado para /entrar; quem está logado mas não é ADMIN recebe 404 em vez
 * de "acesso negado" — não revelamos que o painel existe para clientes.
 * Vira ADMIN quem faz login com um e-mail listado em ADMIN_EMAILS
 * (ver src/lib/orders.ts).
 */
export async function requireAdminUser() {
  const user = await getSessionUser();
  if (!user) redirect("/entrar?next=/admin");
  if (user.role !== "ADMIN") notFound();
  return user;
}

export async function getDashboardStats() {
  const [
    productCounts,
    paidOrdersAgg,
    paidOrdersCount,
    entitlementCount,
    downloadCount,
    recentOrders,
  ] = await Promise.all([
    prisma.product.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.aggregate({ where: { status: "PAID" }, _sum: { totalCents: true } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.entitlement.count(),
    prisma.downloadEvent.count(),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { items: { include: { product: true } } },
    }),
  ]);

  const countByStatus = Object.fromEntries(
    productCounts.map((row) => [row.status, row._count._all]),
  ) as Record<string, number>;

  return {
    totalProducts: productCounts.reduce((sum, row) => sum + row._count._all, 0),
    publishedProducts: countByStatus.PUBLISHED ?? 0,
    draftProducts: countByStatus.DRAFT ?? 0,
    archivedProducts: countByStatus.ARCHIVED ?? 0,
    revenueCents: paidOrdersAgg._sum.totalCents ?? 0,
    paidOrdersCount,
    entitlementCount,
    downloadCount,
    recentOrders,
  };
}
