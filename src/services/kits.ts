import { prisma } from "@/lib/prisma";
import { PRODUCT_IMAGE_PATH, KIT_IMAGE_PATH } from "@/constants";

type GetKitsFilters = {
  limit?: number;
  orderBy?: "price" | "discount" | "newest";
};

export const getAllKits = async (filters: GetKitsFilters) => {
  let orderBy = {};

  switch (filters.orderBy) {
    case "price":
      orderBy = { price: "asc" };
      break;
    case "discount":
      orderBy = { discount: "desc" };
      break;
    case "newest":
      orderBy = { createdAt: "desc" };
      break;
    default:
      orderBy = { discount: "desc" };
      break;
  }

  const kits = await prisma.kit.findMany({
    where: { active: true },
    select: {
      id: true,
      slug: true,
      label: true,
      description: true,
      price: true,
      originalPrice: true,
      discount: true,
      image: true,
      products: {
        select: {
          quantity: true,
          product: {
            select: {
              id: true,
              label: true,
              price: true,
              images: {
                take: 1,
                orderBy: { id: "asc" },
                select: { url: true },
              },
            },
          },
        },
      },
    },
    orderBy,
    take: filters.limit ?? undefined,
  });

  return kits.map((kit) => ({
    ...kit,
    image: kit.image ? `${KIT_IMAGE_PATH}${kit.image}` : null,
    products: kit.products.map((kp) => ({
      ...kp.product,
      quantity: kp.quantity,
      image: kp.product.images[0]
        ? `${PRODUCT_IMAGE_PATH}${kp.product.images[0].url}`
        : null,
      images: undefined,
    })),
  }));
};

export const getKitById = async (id: number) => {
  const kit = await prisma.kit.findUnique({
    where: { id, active: true },
    select: {
      id: true,
      slug: true,
      label: true,
      description: true,
      price: true,
      originalPrice: true,
      discount: true,
      image: true,
      products: {
        select: {
          quantity: true,
          product: {
            select: {
              id: true,
              label: true,
              price: true,
              description: true,
              images: {
                orderBy: { id: "asc" },
                select: { url: true },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!kit) return null;

  return {
    ...kit,
    image: kit.image ? `${KIT_IMAGE_PATH}${kit.image}` : null,
    products: kit.products.map((kp) => ({
      ...kp.product,
      quantity: kp.quantity,
      image: kp.product.images[0]
        ? `${PRODUCT_IMAGE_PATH}${kp.product.images[0].url}`
        : null,
      images: kp.product.images.map((img) => `${PRODUCT_IMAGE_PATH}${img.url}`),
    })),
  };
};

export const getKitBySlug = async (slug: string) => {
  const kit = await prisma.kit.findUnique({
    where: { slug, active: true },
    select: {
      id: true,
      slug: true,
      label: true,
      description: true,
      price: true,
      originalPrice: true,
      discount: true,
      image: true,
      products: {
        select: {
          quantity: true,
          product: {
            select: {
              id: true,
              label: true,
              price: true,
              description: true,
              images: {
                orderBy: { id: "asc" },
                select: { url: true },
              },
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!kit) return null;

  return {
    ...kit,
    image: kit.image ? `${KIT_IMAGE_PATH}${kit.image}` : null,
    products: kit.products.map((kp) => ({
      ...kp.product,
      quantity: kp.quantity,
      image: kp.product.images[0]
        ? `${PRODUCT_IMAGE_PATH}${kp.product.images[0].url}`
        : null,
      images: kp.product.images.map((img) => `${PRODUCT_IMAGE_PATH}${img.url}`),
    })),
  };
};