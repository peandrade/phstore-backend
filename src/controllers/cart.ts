import { cartMountSchema } from "@/schemas/cartMountSchema";
import { getProduct } from "@/services/product";
import { getAbsoluteImgUrl } from "@/utils/getAbsoluteImgUrl";
import { RequestHandler } from "express";
import { calculateShippingSchema } from "./../schemas/calculateShippingSchema";
import { AuthenticatedRequest } from "@/types/express";
import { cartFinishSchema } from "@/schemas/cartFinishSchema";
import { getAddressesById } from "@/services/user";
import { createOrder } from "@/services/order";
import { createPaymentLink } from "@/services/payment";
import { logger } from "@/lib/logger";
import { calculateShipping as calculateShippingService } from "@/services/shipping";

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
          image: product.images[0] ? getAbsoluteImgUrl(product.images[0]) : null,
        });
      }
    }

    res.json({ products });
  } catch (error) {
    logger.error({ error, body: req.body }, "Error in cartMount");
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

    const shipping = await calculateShippingService(zipcode);

    if (!shipping) {
      return res.status(400).json({ error: "Invalid zipcode or unable to calculate shipping" });
    }

    res.json({
      zipcode,
      cost: shipping.cost,
      days: shipping.days,
      city: shipping.city,
      state: shipping.state,
    });
  } catch (error) {
    logger.error({ error, query: req.query }, "Error in calculateShipping");
    res.status(500).json({ error: "Internal server error" });
  }
};

export const finish: RequestHandler = async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) return res.status(401).json({ error: "Access denied" });

    const result = cartFinishSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: "Invalid cart data" });

    const { cart, addressId } = result.data;

    const addressData = await getAddressesById(userId, addressId);
    if (!addressData) return res.status(400).json({ error: "Invalid address" });

    const shipping = await calculateShippingService(addressData.zipcode);
    if (!shipping) {
      return res.status(400).json({ error: "Unable to calculate shipping for this address" });
    }

    const shippingCost = shipping.cost;
    const shippingDays = shipping.days;

    const orderId = await createOrder({
      userId,
      address: {
        zipcode: addressData.zipcode,
        street: addressData.street,
        number: addressData.number,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        complement: addressData.complement,
      },
      shippingCost,
      shippingDays,
      cart,
    });

    if (orderId === null || orderId === undefined) {
      return res.status(500).json({ error: "Failed to create order" });
    }

    const url = await createPaymentLink({
      cart,
      shippingCost,
      orderId,
    });

    console.log(`Aqui esta a url: ${url}`);

    if (!url) {
      return res.status(500).json({ error: "Failed to create payment link" });
    }

    res.status(201).json({ orderId, url });
  } catch (error) {
    logger.error({ error, userId: (req as AuthenticatedRequest).userId }, "Error in finish");
    res.status(500).json({ error: "Internal server error" });
  }
};
