import { RequestHandler } from "express";
import {
  getProductSchema,
  getOneProductSchema,
  getRelatedProductQuerySchema,
  getRelatedProductSchema,
} from "@/schemas";
import {
  getAllProducts,
  getProductsFromSameCategory,
  incrementProductView,
  getProductWithCategory,
} from "@/services/product";
import { getAbsoluteImgUrl } from "@/utils/getAbsoluteImgUrl";
import { NotFoundError, BadRequestError } from "@/lib/errors";

export const getProducts: RequestHandler = async (req, res, next) => {
  try {
    const { metadata, orderBy, limit } = getProductSchema.parse(req.query);

    let parsedMetadata;
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (_error) {
        throw new BadRequestError("Invalid metadata JSON format");
      }
    }

    const products = await getAllProducts({
      metadata: parsedMetadata,
      order: orderBy,
      limit,
    });

    const productsWithUrl = products.map((product) => ({
      ...product,
      image: product.image ? getAbsoluteImgUrl(product.image) : null,
      liked: false,
    }));

    res.json({ products: productsWithUrl });
  } catch (error) {
    next(error);
  }
};

export const getOneProduct: RequestHandler = async (req, res, next) => {
  try {
    const { id } = getOneProductSchema.parse(req.params);
    const result = await getProductWithCategory(id);

    if (!result) {
      throw new NotFoundError("Product not found");
    }

    const productWithUrl = {
      ...result.product,
      images: result.product.images.map((img) => getAbsoluteImgUrl(img)),
    };

    await incrementProductView(result.product.id);

    res.json({ product: productWithUrl, category: result.category });
  } catch (error) {
    next(error);
  }
};

export const getRelatedProducts: RequestHandler = async (req, res, next) => {
  try {
    const { id } = getRelatedProductSchema.parse(req.params);
    const { limit } = getRelatedProductQuerySchema.parse(req.query);

    const products = await getProductsFromSameCategory(id, limit);

    const productsWithUrl = products.map((product) => ({
      ...product,
      image: product.image ? getAbsoluteImgUrl(product.image) : null,
      liked: false,
    }));

    res.json({ products: productsWithUrl });
  } catch (error) {
    next(error);
  }
};
