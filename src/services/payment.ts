import { createStripeCheckoutSession, getStripeCheckoutSession } from "@/lib/stripe";
import { CreatePayment } from "@/types";
import { logger } from "@/lib/logger";

export const createPaymentLink = async ({ cart, shippingCost, orderId }: CreatePayment) => {
  try {
    const session = await createStripeCheckoutSession({
      cart,
      shippingCost,
      orderId,
    });
    return session.url ?? null;
  } catch (error) {
    logger.error({ error, orderId, cartLength: cart.length }, "Error creating payment link");
    return null;
  }
};

export const getOrderIdFromSession = async (sessionId: string) => {
  try {
    const session = await getStripeCheckoutSession(sessionId);
    const orderId = session.metadata?.orderId;

    if (!orderId) return null;
    return parseInt(orderId);
  } catch (error) {
    logger.error({ error, sessionId }, "Error getting order from session");
    return null;
  }
};
