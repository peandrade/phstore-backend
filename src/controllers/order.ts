import { getOrderBySessionIdSchema } from "@/schemas/getOrderBySessionIdSchema";
import { getOrderSchema } from "@/schemas/getOrderSchema";
import { getOrderById, getUserOrders } from "@/services/order";
import { getOrderIdFromSession } from "@/services/payment";
import { AuthenticatedRequest } from "@/types";
import { getAbsoluteImgUrl } from "@/utils/getAbsoluteImgUrl";
import { RequestHandler } from "express";

export const getOrderBySessionId: RequestHandler = async (req, res) => {
  try {
    const result = getOrderBySessionIdSchema.safeParse(req.query);
    if (!result.success)
      return res.status(400).json({ error: "Invalid Session Id" });

    const { session_id } = result.data;

    const orderId = await getOrderIdFromSession(session_id);
    if (!orderId) return res.status(404).json({ error: "Order not found" });
    res.json({ orderId });
  } catch (error) {
    console.error("Error in getOrderBySessionId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getOrder: RequestHandler = async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) return res.status(401).json({ error: "Access denied" });

    const result = getOrderSchema.safeParse(req.params);
    if (!result.success) return res.status(400).json({ error: "Invalid ID" });

    const { id } = result.data;

    const order = await getOrderById(parseInt(id), userId);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const itemsWithAbsoluteUrl = order.orderItems.map((item) => ({
      ...item,
      product: {
        ...item.product,
        image: item.product.image
          ? getAbsoluteImgUrl(item.product.image)
          : null,
      },
    }));

    res.json({ order: { ...order, orderItems: itemsWithAbsoluteUrl } });
  } catch (error) {
    console.error("Error in getOrder:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const listOrders: RequestHandler = async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) return res.status(401).json({ error: "Access denied" });
    const orders = await getUserOrders(userId);
    res.json({ orders });
  } catch (error) {
    console.error("Error in listOrders:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
