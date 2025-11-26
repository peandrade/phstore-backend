import { cartMountSchema } from "@/schemas/cartMountSchema";
import { getProduct } from "@/services/product";
import { getAbsoluteImgUrl } from "@/utils/getAbsoluteImgUrl";
import { RequestHandler } from "express";
import { calculateShippingSchema } from "./../schemas/calculateShippingSchema";

export const cartMount: RequestHandler = async (req, res) => {
  try {
    const parseResult = cartMountSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid parameters" });
    }
    const { ids } = parseResult.data;

    let products = [];
    for (let id of ids) {
      const product = await getProduct(id);
      if (product) {
        products.push({
          id: product.id,
          label: product.label,
          price: product.price,
          image: product.images[0]
            ? getAbsoluteImgUrl(product.images[0])
            : null,
        });
      }
    }

    res.json({ error: null, products });
  } catch (error) {
    console.error("Error in cartMount:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const calculateShipping: RequestHandler = async (req, res) => {
  try {
    const parseResult = calculateShippingSchema.safeParse(req.query);
    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid parameters" });
    }
    const { zipcode } = parseResult.data;

    res.json({ error: null, zipcode, cost: 7, days: 3 });
  } catch (error) {
    console.error("Error in calculateShipping:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
