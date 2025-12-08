import { Address } from "./address";
import { CartItem } from "./cart";

export type CreateOrderCart = {
  userId: number;
  address: Address;
  shippingCost: number;
  shippingDays: number;
  cart: CartItem[];
};
