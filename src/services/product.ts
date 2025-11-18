import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { PRODUCT_IMAGE_PATH, DEFAULT_RELATED_PRODUCTS_LIMIT } from "@/constants";

type ServiceProductFilters = {
  metadata?: { [key: string]: string };
  order?: string;
  limit?: number;
};

export const getAllProducts = async (filters: ServiceProductFilters) => {
  let orderBy = {};

  switch (filters.order) {
    case "views":
      orderBy = { viewsCount: "desc" };
      break;
    case "selling":
      orderBy = { salesCount: "desc" };
      break;
    case "price":
      orderBy = { price: "asc" };
      break;
    default:
      orderBy = { viewsCount: "desc" };
      break;
  }

  let where: Prisma.ProductWhereInput = {};

  if (filters.metadata && typeof filters.metadata === "object" && !Array.isArray(filters.metadata)) {
    let metaFilters = [];
    for (let categoryMetadataId in filters.metadata) {
      const value = filters.metadata[categoryMetadataId];
      if (typeof value !== "string") continue;
      const valuesId = value
        .split("|")
        .map((v) => v.trim())
        .filter(Boolean);
      if (valuesId.length === 0) continue;

      metaFilters.push({
        metadata: {
          some: {
            categoryMetadataId,
            metadataValueId: { in: valuesId },
          },
        },
      });
    }
    if (metaFilters.length > 0) {
      where.AND = metaFilters;
    }
  }

  const products = await prisma.product.findMany({
    select: {
      id: true,
      label: true,
      price: true,
      images: {
        take: 1,
        orderBy: { id: "asc" },
        select: {
          url: true,
        },
      },
    },
    where,
    orderBy,
    take: filters.limit ?? undefined,
  });

  return products.map((product) => ({
    ...product,
    image: product.images[0] ? `${PRODUCT_IMAGE_PATH}${product.images[0].url}` : null,
    images: undefined,
  }));
};

export const getProduct = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      label: true,
      price: true,
      description: true,
      categoryId: true,
      images: true,
    },
  });

  if (!product) return null;

  return {
    ...product,
    images:
      product.images.length > 0
        ? product.images.map((img) => `${PRODUCT_IMAGE_PATH}${img.url}`)
        : [],
  };
};

export const getProductWithCategory = async (id: number) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      label: true,
      price: true,
      description: true,
      categoryId: true,
      images: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!product) return null;

  return {
    product: {
      id: product.id,
      label: product.label,
      price: product.price,
      description: product.description,
      categoryId: product.categoryId,
      images:
        product.images.length > 0
          ? product.images.map((img) => `${PRODUCT_IMAGE_PATH}${img.url}`)
          : [],
    },
    category: product.category,
  };
};

export const incrementProductView = async (id: number) => {
  await prisma.product.update({
    where: { id },
    data: {
      viewsCount: { increment: 1 },
    },
  });
};

export const getProductsFromSameCategory = async (
  id: number,
  limit: number = DEFAULT_RELATED_PRODUCTS_LIMIT
) => {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { categoryId: true },
  });
  if (!product) return [];

  const products = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: id },
    },
    select: {
      id: true,
      label: true,
      price: true,
      images: {
        take: 1,
        orderBy: { id: "asc" },
        select: {
          url: true,
        },
      },
    },
    take: limit,
    orderBy: { viewsCount: "desc" },
  });

  return products.map(product => ({
    ...product,
    image: product.images[0] ? `${PRODUCT_IMAGE_PATH}${product.images[0].url}` : null,
    images: undefined
  }))
};
