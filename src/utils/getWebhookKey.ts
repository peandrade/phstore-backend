export const getWebhookKey = () => {
    const key = process.env.STRIPE_WEBHOOK_KEY;
    if (!key) {
        throw new Error('STRIPE_WEBHOOK_KEY is not defined in environment variables');
    }
    return key;
}