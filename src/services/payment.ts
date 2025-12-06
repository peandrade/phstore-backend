import { createStripeCheckoutSession } from "@/lib/stripe";
import { CreatePayment } from "@/types";

export const createPaymentLink = async ({
  cart,
  shippingCost,
  orderId,
}: CreatePayment) => {
  try {
    const session = await createStripeCheckoutSession({ cart, shippingCost, orderId });
    return session.url ?? null;
  } catch (error) {
    console.error("Error creating payment link:", error);
    return null;
  }
};
