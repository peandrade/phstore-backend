import { getProduct } from "@/services/product";
import { CreatePayment } from "@/types";
import { getFrontendURL } from "@/utils/getFrontendUrl";
import { getStripeKey } from "@/utils/getStripeKey";
import Stripe from "stripe";

export const stripe = new Stripe(getStripeKey());

export const createStripeCheckoutSession = async ({
  cart,
  shippingCost,
  orderId,
}: CreatePayment) => {
  let stripeLineItems = [];
  for (let item of cart) {
    const product = await getProduct(item.productId);
    if (!product) {
      throw new Error(`Product with ID ${item.productId} not found`);
    }

    stripeLineItems.push({
      price_data: {
        product_data: {
          name: product.label,
        },
        currency: "BRL",
        unit_amount: Math.round(product.price * 100),
      },
      quantity: item.quantity,
    });
  }

  if (shippingCost > 0) {
    stripeLineItems.push({
      price_data: {
        product_data: {
          name: "Frete",
        },
        currency: "BRL",
        unit_amount: Math.round(shippingCost * 100),
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    line_items: stripeLineItems,
    mode: "payment",
    metadata: { orderId: orderId.toString() },
    success_url: `${getFrontendURL()}/cart/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getFrontendURL()}/my-orders`,
  });

  return session;
};

export const getConstructEvent = async (
  rawBody: string,
  sig: string,
  webhookKey: string
) => {
  try {
    return stripe.webhooks.constructEvent(rawBody, sig, webhookKey);
  } catch (error) {
    console.error('Failed to construct webhook event:', error instanceof Error ? error.message : error);
    return null;
  }
};
