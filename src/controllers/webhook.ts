import { getConstructEvent } from "@/lib/stripe";
import { updateOrderStatus } from "@/services/order";
import { getWebhookKey } from "@/utils/getWebhookKey";
import { RequestHandler } from "express";
import Stripe from "stripe";
import { logger } from "@/lib/logger";

export const stripe: RequestHandler = async (req, res) => {
  logger.info("Webhook received - starting processing");

  try {
    const sig = req.headers["stripe-signature"] as string;

    if (!sig) {
      logger.error("Missing stripe-signature header");
      return res.status(400).json({ error: "Missing stripe-signature header" });
    }

    const webhookKey = getWebhookKey();
    const rawBody = req.body;

    logger.info({
      bodyType: typeof rawBody,
      isBuffer: Buffer.isBuffer(rawBody),
      bodyLength: rawBody?.length
    }, "Webhook body info");

    const event = await getConstructEvent(rawBody, sig, webhookKey);

    if (!event) {
      logger.error("Invalid signature - event construction failed");
      return res.status(400).json({ error: "Invalid signature" });
    }

    logger.info({ eventType: event.type }, "Webhook event parsed successfully");

    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = parseInt(session.metadata?.orderId || "");

    if (isNaN(orderId) || orderId <= 0) {
      logger.error(
        { orderId: session.metadata?.orderId, sessionId: session.id },
        "Invalid orderId in webhook"
      );
      return res.status(400).json({ error: "Invalid orderId in metadata" });
    }

    logger.info({ orderId, eventType: event.type }, "Processing order status update");

    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await updateOrderStatus(orderId, "paid");
        logger.info({ orderId }, "Order marked as paid");
        break;
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed":
        await updateOrderStatus(orderId, "cancelled");
        logger.info({ orderId }, "Order marked as cancelled");
        break;
      default:
        logger.info({ eventType: event.type }, "Unhandled event type");
    }

    res.json({ received: true });
  } catch (error) {
    logger.error({ error }, "Webhook error");
    res.status(500).json({ error: "Webhook handler failed" });
  }
};
