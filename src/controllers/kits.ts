import { RequestHandler } from "express";
import { NotFoundError } from "@/lib/errors";
import { getAbsoluteImgUrl } from "@/utils/getAbsoluteImgUrl";
import { getAllKits, getKitById, getKitBySlug } from "@/services/kits";
import { getKitsSchema, getOneKitSchema, getKitBySlugSchema } from "@/schemas/getKitsSchema";

export const getKits: RequestHandler = async (req, res, next) => {
  try {
    const { limit, orderBy } = getKitsSchema.parse(req.query);

    const kits = await getAllKits({ limit, orderBy });

    const kitsWithUrl = kits.map((kit) => ({
      ...kit,
      image: kit.image ? getAbsoluteImgUrl(kit.image) : null,
      products: kit.products.map((product) => ({
        ...product,
        image: product.image ? getAbsoluteImgUrl(product.image) : null,
      })),
    }));

    res.json({ kits: kitsWithUrl });
  } catch (error) {
    next(error);
  }
};

export const getOneKit: RequestHandler = async (req, res, next) => {
  try {
    const { id } = getOneKitSchema.parse(req.params);

    const kit = await getKitById(id);

    if (!kit) {
      throw new NotFoundError("Kit not found");
    }

    const kitWithUrl = {
      ...kit,
      image: kit.image ? getAbsoluteImgUrl(kit.image) : null,
      products: kit.products.map((product) => ({
        ...product,
        image: product.image ? getAbsoluteImgUrl(product.image) : null,
        images: product.images.map((img) => getAbsoluteImgUrl(img)),
      })),
    };

    res.json({ kit: kitWithUrl });
  } catch (error) {
    next(error);
  }
};

export const getKitBySlugController: RequestHandler = async (req, res, next) => {
  try {
    const { slug } = getKitBySlugSchema.parse(req.params);

    const kit = await getKitBySlug(slug);

    if (!kit) {
      throw new NotFoundError("Kit not found");
    }

    const kitWithUrl = {
      ...kit,
      image: kit.image ? getAbsoluteImgUrl(kit.image) : null,
      products: kit.products.map((product) => ({
        ...product,
        image: product.image ? getAbsoluteImgUrl(product.image) : null,
        images: product.images.map((img) => getAbsoluteImgUrl(img)),
      })),
    };

    res.json({ kit: kitWithUrl });
  } catch (error) {
    next(error);
  }
};
