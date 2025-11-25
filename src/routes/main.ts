import { Router } from "express";
import * as bannerController from '@/controllers/banner';
import * as productController from '@/controllers/product';
import * as categoryController from '@/controllers/category';

export const routes = Router();

routes.get('/ping', (req, res) => {
    res.json({ pong: true });
});

routes.get('/banners', bannerController.getBanners);
routes.get('/products', productController.getProducts);
routes.get('/product/:id', productController.getOneProduct);
routes.get('/product/:id/related', productController.getRelatedProducts);
routes.get('/category/:slug/metadata', categoryController.getCategoryWithMetadata);