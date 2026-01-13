import { RequestHandler } from "express";
import { AuthenticatedRequest } from "@/types/express";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export const toggleLike: RequestHandler = async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      return res.status(401).json({ error: "Access denied" });
    }

    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      });

      return res.json({ liked: false, message: "Like removed" });
    } else {
      await prisma.like.create({
        data: {
          userId,
          productId,
        },
      });

      return res.json({ liked: true, message: "Like added" });
    }
  } catch (error) {
    logger.error({ error, userId: (req as AuthenticatedRequest).userId }, "Error in toggleLike");
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserLikes: RequestHandler = async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      return res.status(401).json({ error: "Access denied" });
    }

    const likes = await prisma.like.findMany({
      where: { userId },
      select: { productId: true },
    });

    const productIds = likes.map((like) => like.productId);

    return res.json({ likes: productIds });
  } catch (error) {
    logger.error({ error, userId: (req as AuthenticatedRequest).userId }, "Error in getUserLikes");
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const checkLike: RequestHandler = async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) {
      return res.status(401).json({ error: "Access denied" });
    }

    const productId = parseInt(req.params.productId);
    if (isNaN(productId)) {
      return res.status(400).json({ error: "Invalid product ID" });
    }

    const like = await prisma.like.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    return res.json({ liked: !!like });
  } catch (error) {
    logger.error({ error, userId: (req as AuthenticatedRequest).userId }, "Error in checkLike");
    return res.status(500).json({ error: "Internal server error" });
  }
};