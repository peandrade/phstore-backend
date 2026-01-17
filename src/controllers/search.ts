// src/controllers/search.ts
import { RequestHandler } from "express";
import { prisma } from "@/lib/prisma";
import { getAbsoluteImgUrl } from "@/utils/getAbsoluteImgUrl";

// Busca produtos e kits
export const search: RequestHandler = async (req, res, next) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!query || query.trim().length < 2) {
      return res.json({ products: [], kits: [], total: 0 });
    }

    const searchTerm = query.trim().toLowerCase();

    // Busca produtos
    const products = await prisma.product.findMany({
      where: {
        label: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        label: true,
        price: true,
        images: {
          take: 1,
          select: { url: true },
        },
      },
      take: limit,
      orderBy: {
        salesCount: "desc",
      },
    });

    // Busca kits com produtos inclusos
    const kits = await prisma.kit.findMany({
      where: {
        active: true,
        OR: [
          {
            label: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        slug: true,
        label: true,
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
                  select: { url: true },
                },
              },
            },
          },
        },
      },
      take: limit,
    });

    // Formata produtos com URL absoluta da imagem
    const formattedProducts = products.map((product) => ({
      id: product.id,
      label: product.label,
      price: product.price,
      image: product.images[0]?.url 
        ? getAbsoluteImgUrl(`media/products/${product.images[0].url}`)
        : null,
    }));

    // Formata kits com URL absoluta da imagem e produtos formatados
    const formattedKits = kits.map((kit) => ({
      id: kit.id,
      slug: kit.slug,
      label: kit.label,
      price: kit.price,
      originalPrice: kit.originalPrice,
      discount: kit.discount,
      image: kit.image ? getAbsoluteImgUrl(`media/kits/${kit.image}`) : null,
      products: kit.products.map((kp) => ({
        id: kp.product.id,
        label: kp.product.label,
        price: kp.product.price,
        quantity: kp.quantity,
        image: kp.product.images[0]?.url
          ? getAbsoluteImgUrl(`media/products/${kp.product.images[0].url}`)
          : null,
      })),
    }));

    return res.json({
      products: formattedProducts,
      kits: formattedKits,
      total: formattedProducts.length + formattedKits.length,
    });
  } catch (error) {
    next(error);
  }
};