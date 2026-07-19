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
