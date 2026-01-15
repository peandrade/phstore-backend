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

export const updateOrderStatus = async (
  orderId: number,
  status: "paid" | "cancelled" | "refunded"
) => {
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

export const refundOrder = async (orderId: number, userId: number) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
  });

  if (!order) {
    return { success: false, error: "Pedido não encontrado" };
  }

  if (order.status !== "paid") {
    return {
      success: false,
      error: "Apenas pedidos pagos podem ser reembolsados",
    };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "refunded" },
  });

  logger.info({ orderId, userId }, "Order refunded successfully");

  return { success: true };
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

export const getOrderForRetryPayment = async (orderId: number, userId: number) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: {
      id: true,
      status: true,
      shippingCost: true,
      orderItems: {
        select: {
          productId: true,
          quantity: true,
        },
      },
    },
  });

  if (!order) {
    return { success: false, error: "Pedido não encontrado" };
  }

  if (order.status !== "pending") {
    return { success: false, error: "Este pedido não está pendente de pagamento" };
  }

  return {
    success: true,
    order: {
      id: order.id,
      shippingCost: order.shippingCost,
      cart: order.orderItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    },
  };
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
        image: item.product.images[0]
          ? `media/products/${item.product.images[0].url}`
          : null,
        images: undefined,
      },
    })),
  };
};
