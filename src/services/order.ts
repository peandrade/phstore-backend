import { prisma } from "@/lib/prisma";
import { CreateOrderCart } from "@/types";
import { getProduct } from "./product";
import { logger } from "@/lib/logger";

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
      orderItems: { create: orderItems },
    },
  });

  if (!order) return null;
  return order.id;
};

export const updateOrderStatus = async (orderId: number, status: "paid" | "cancelled") => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new Error(`Order with ID ${orderId} not found`);
    }

    await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    logger.info({ orderId, status }, "Order status updated");
  } catch (error) {
    logger.error({ error, orderId, status }, "Failed to update order status");
    throw error;
  }
};

export const getUserOrders = async (userId: number) => {
  return await prisma.order.findMany({
    where: { userId },
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getOrderById = async (id: number, userId: number) => {
  const order = await prisma.order.findFirst({
    where: { id, userId },
    select: {
      id: true,
      status: true,
      total: true,
      shippingCost: true,
      shippingDays: true,
      shippingCity: true,
      shippingComplement: true,
      shippingCountry: true,
      shippingNumber: true,
      shippingState: true,
      shippingStreet: true,
      shippingZipcode: true,
      createdAt: true,
      orderItems: {
        select: {
          id: true,
          quantity: true,
          price: true,
          product: {
            select: {
              id: true,
              label: true,
              price: true,
              images: {
                take: 1,
                orderBy: { id: "asc" },
              },
            },
          },
        },
      },
    },
  });
  if (!order) return null;

  return {
    ...order,
    orderItems: order.orderItems.map((item) => ({
      ...item,
      product: {
        ...item.product,
        image: item.product.images[0] ? `media/products/${item.product.images[0].url}` : null,
        images: undefined,
      },
    })),
  };
};
