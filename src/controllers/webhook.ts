import { getConstructEvent } from "@/lib/stripe";
import { updateOrderStatus } from "@/services/order";
import { getWebhookKey } from "@/utils/getWebhookKey";
import { RequestHandler } from "express";
import Stripe from "stripe";

export const stripe: RequestHandler = async (req, res) => {
    try {
        const sig = req.headers['stripe-signature'] as string;

        if (!sig) {
            return res.status(400).json({ error: 'Missing stripe-signature header' });
        }

        const webhookKey = getWebhookKey();
        const rawBody = req.body;

        const event = await getConstructEvent(rawBody, sig, webhookKey);

        if (!event) {
            return res.status(400).json({ error: 'Invalid signature' });
        }

        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = parseInt(session.metadata?.orderId || '');

        if (isNaN(orderId) || orderId <= 0) {
            console.error('Invalid orderId in webhook:', session.metadata?.orderId);
            return res.status(400).json({ error: 'Invalid orderId in metadata' });
        }

        switch(event.type){
            case 'checkout.session.completed':
            case 'checkout.session.async_payment_succeeded':
                await updateOrderStatus(orderId, 'paid');
                break;
            case 'checkout.session.expired':
            case 'checkout.session.async_payment_failed':
                await updateOrderStatus(orderId, 'cancelled');
                break;
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
}