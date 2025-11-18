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

export const getProducts: RequestHandler = async (req, res) => {
  try {
    const parseResult = getProductSchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid parameters" });
    }

    const { metadata, orderBy, limit } = parseResult.data;

    let parsedMetadata;
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch (error) {
        return res.status(400).json({ error: "Invalid metadata JSON format" });
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

    res.json({ error: null, products: productsWithUrl });
  } catch (error) {
    console.error("Error in getProducts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getOneProduct: RequestHandler = async (req, res) => {
  try {
    const parseResult = getOneProductSchema.safeParse(req.params);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid parameters" });
    }
    const { id } = parseResult.data;
    const result = await getProductWithCategory(id);
    if (!result) {
      return res.status(404).json({ error: "Product not found" });
    }

    const productWithUrl = {
      ...result.product,
      images: result.product.images.map((img) => getAbsoluteImgUrl(img)),
    };

    await incrementProductView(result.product.id);

    res.json({ error: null, product: productWithUrl, category: result.category });
  } catch (error) {
    console.error("Error in getOneProduct:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRelatedProducts: RequestHandler = async (req, res) => {
  try {
    const paramsResult = getRelatedProductSchema.safeParse(req.params);
    const queryResult = getRelatedProductQuerySchema.safeParse(req.query);

    if (!paramsResult.success || !queryResult.success) {
      return res.status(400).json({ error: "Invalid parameters" });
    }

    const { id } = paramsResult.data;
    const { limit } = queryResult.data;

    const products = await getProductsFromSameCategory(id, limit);

    const productsWithUrl = products.map((product) => ({
      ...product,
      image: product.image ? getAbsoluteImgUrl(product.image) : null,
      liked: false,
    }));

    res.json({ error: null, products: productsWithUrl });
  } catch (error) {
    console.error("Error in getRelatedProducts:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
