import {
  createStripeCheckoutSession,
  getStripeCheckoutSession,
} from "@/lib/stripe";
import { CreatePayment } from "@/types";

export const createPaymentLink = async ({
  cart,
  shippingCost,
  orderId,
}: CreatePayment) => {
  try {
    const session = await createStripeCheckoutSession({
      cart,
      shippingCost,
      orderId,
    });
    return session.url ?? null;
  } catch (error) {
    console.error("Error creating payment link:", error);
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
    console.error("Error to get a session id", error);
    return null;
  }
};
