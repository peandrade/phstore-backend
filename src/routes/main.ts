import { Router } from "express";
import * as bannerController from "@/controllers/banner";
import * as productController from "@/controllers/product";
import * as categoryController from "@/controllers/category";
import * as cartController from "@/controllers/cart";
import * as userController from "@/controllers/user";
import * as webhookController from "@/controllers/webhook";
import * as orderController from "@/controllers/order";
import * as likeController from "@/controllers/like";
import { authMiddleware } from "@/middleware/auth";
import { authRateLimiter, checkoutRateLimiter } from "@/middleware/rateLimiter";
import { getKits, getOneKit, getKitBySlugController } from "@/controllers/kits";

export const routes = Router();

routes.get("/ping", (req, res) => {
  res.json({ pong: true });
});

routes.get("/banners", bannerController.getBanners);
routes.get("/products", productController.getProducts);
routes.get("/product/:id", productController.getOneProduct);
routes.get("/product/:id/related", productController.getRelatedProducts);
routes.get("/category/:slug/metadata", categoryController.getCategoryWithMetadata);
routes.post("/cart/mount", cartController.cartMount);
routes.get("/cart/shipping", cartController.calculateShipping);
routes.post("/user/register", authRateLimiter, userController.register);
routes.post("/user/login", authRateLimiter, userController.login);
routes.post("/user/refresh", userController.refresh);
routes.post("/user/logout", userController.logout);
routes.post("/user/addresses", authMiddleware, userController.addAddress);
routes.get("/user/addresses", authMiddleware, userController.getAddresses);
routes.post("/cart/finish", authMiddleware, checkoutRateLimiter, cartController.finish);
routes.post("/webhook/stripe", webhookController.stripe);
routes.get("/orders/session", orderController.getOrderBySessionId);
routes.get("/orders", authMiddleware, orderController.listOrders);
routes.get("/orders/:id", authMiddleware, orderController.getOrder);
routes.get("/kits", getKits);
routes.get("/kit/:id", getOneKit);
routes.get("/kit/slug/:slug", getKitBySlugController);
routes.get("/user/likes", authMiddleware, likeController.getUserLikes);
routes.post("/products/:productId/like", authMiddleware, likeController.toggleLike);
routes.get("/products/:productId/like", authMiddleware, likeController.checkLike);