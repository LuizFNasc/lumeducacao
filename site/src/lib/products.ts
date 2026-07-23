import { prisma } from "@/lib/prisma";

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
}

export async function getSubjects() {
  return prisma.subject.findMany({ orderBy: { sortOrder: "asc" } });
}

export interface ProductFilters {
  categorySlug?: string;
  subjectSlug?: string;
  query?: string;
}

export async function listProducts(filters: ProductFilters = {}) {
  const { categorySlug, subjectSlug, query } = filters;

  return prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      category: categorySlug ? { slug: categorySlug } : undefined,
      subjects: subjectSlug ? { some: { subject: { slug: subjectSlug } } } : undefined,
      title: query ? { contains: query, mode: "insensitive" } : undefined,
    },
    include: {
      category: true,
      subjects: { include: { subject: true } },
    },
    orderBy: { title: "asc" },
  });
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: {
      category: true,
      subjects: { include: { subject: true } },
      files: true,
      bundleItems: { include: { itemProduct: true } },
    },
  });
}

export type ProductListItem = Awaited<ReturnType<typeof listProducts>>[number];
export type ProductDetail = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

// ---------- Admin ----------

export interface AdminProductFilters {
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  query?: string;
}

export async function listAllProductsForAdmin(filters: AdminProductFilters = {}) {
  return prisma.product.findMany({
    where: {
      status: filters.status,
      title: filters.query ? { contains: filters.query, mode: "insensitive" } : undefined,
    },
    include: { category: true, _count: { select: { files: true } } },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getProductByIdForAdmin(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: { files: true, subjects: { include: { subject: true } } },
  });
}

export interface AdminProductUpdateInput {
  title: string;
  description: string;
  priceCents: number;
  categoryId: string | null;
  coverImageUrl: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}

export async function updateProductForAdmin(id: string, data: AdminProductUpdateInput) {
  return prisma.product.update({ where: { id }, data });
}
