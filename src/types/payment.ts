import { CartItem } from "./cart"

export type CreatePayment = {
    cart: CartItem[];
    shippingCost: number;
    orderId: number;
}