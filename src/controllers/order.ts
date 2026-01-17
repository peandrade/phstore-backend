import { getOrderBySessionIdSchema } from "@/schemas/getOrderBySessionIdSchema";
import { getOrderSchema } from "@/schemas/getOrderSchema";
import { getOrderById, getUserOrders, refundOrder, getOrderForRetryPayment } from "@/services/order";
import { getOrderIdFromSession } from "@/services/payment";
import { createPaymentLink } from "@/services/payment";
import { AuthenticatedRequest } from "@/types";
import { getAbsoluteImgUrl } from "@/utils/getAbsoluteImgUrl";
import { RequestHandler } from "express";
import { NotFoundError, UnauthorizedError, BadRequestError } from "@/lib/errors";

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

export const requestRefund: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) throw new UnauthorizedError("Access denied");

    const { id } = getOrderSchema.parse(req.params);
    const result = await refundOrder(parseInt(id), userId);

    if (!result.success) {
      throw new BadRequestError(result.error || "Erro ao processar reembolso");
    }

    res.json({ success: true, message: "Reembolso solicitado com sucesso" });
  } catch (error) {
    next(error);
  }
};

export const retryPayment: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) throw new UnauthorizedError("Access denied");

    const { id } = getOrderSchema.parse(req.params);
    const result = await getOrderForRetryPayment(parseInt(id), userId);

    if (!result.success || !result.order) {
      throw new BadRequestError(result.error || "Erro ao processar pagamento");
    }

    const paymentUrl = await createPaymentLink({
      cart: result.order.cart,
      shippingCost: result.order.shippingCost,
      orderId: result.order.id,
    });

    if (!paymentUrl) {
      throw new BadRequestError("Erro ao criar link de pagamento");
    }

    res.json({ success: true, paymentUrl });
  } catch (error) {
    next(error);
  }
};