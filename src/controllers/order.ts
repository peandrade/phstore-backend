import { getOrderBySessionIdSchema } from "@/schemas/getOrderBySessionIdSchema";
import { getOrderSchema } from "@/schemas/getOrderSchema";
import { getOrderById, getUserOrders } from "@/services/order";
import { getOrderIdFromSession } from "@/services/payment";
import { AuthenticatedRequest } from "@/types";
import { getAbsoluteImgUrl } from "@/utils/getAbsoluteImgUrl";
import { RequestHandler } from "express";
import { NotFoundError, UnauthorizedError } from "@/lib/errors";

export const getOrderBySessionId: RequestHandler = async (req, res, next) => {
  try {
    const { session_id } = getOrderBySessionIdSchema.parse(req.query);
    const orderId = await getOrderIdFromSession(session_id);

    if (!orderId) {
      throw new NotFoundError("Order not found");
    }

    res.json({ orderId });
  } catch (error) {
    next(error);
  }
};

export const getOrder: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) throw new UnauthorizedError("Access denied");

    const { id } = getOrderSchema.parse(req.params);
    const order = await getOrderById(parseInt(id), userId);

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    const itemsWithAbsoluteUrl = order.orderItems.map((item) => ({
      ...item,
      product: {
        ...item.product,
        image: item.product.image ? getAbsoluteImgUrl(item.product.image) : null,
      },
    }));

    res.json({ order: { ...order, orderItems: itemsWithAbsoluteUrl } });
  } catch (error) {
    next(error);
  }
};

export const listOrders: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) throw new UnauthorizedError("Access denied");

    const orders = await getUserOrders(userId);
    res.json({ orders });
  } catch (error) {
    next(error);
  }
};
