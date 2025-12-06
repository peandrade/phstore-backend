import { prisma } from "@/lib/prisma";
import { CreateOrderCart } from "@/types";
import { getProduct } from "./product";

export const createOrder = async ({
  userId,
  address,
  shippingCost,
  shippingDays,
  cart,
}: CreateOrderCart) => {
  let subtotal = 0;
  let orderItems = [];

  for (let cartItem of cart) {
    const product = await getProduct(cartItem.productId);
    if (product) {
      subtotal += product.price * cartItem.quantity;

      orderItems.push({
        productId: product.id,
        quantity: cartItem.quantity,
        price: product.price,
      });
    }
  }

  const total = subtotal + shippingCost;

  const order = await prisma.order.create({
    data: {
      userId,
      total,
      shippingCost,
      shippingDays,
      shippingZipcode: address.zipcode,
      shippingStreet: address.street,
      shippingNumber: address.number,
      shippingCity: address.city,
      shippingState: address.state,
      shippingCountry: address.country,
      shippingComplement: address.complement,
      orderItems: { create: orderItems }
    },
  });

  if (!order) return null;
  return order.id;
};
