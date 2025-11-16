import { RequestHandler } from "express";
import { getAllBanners } from "../services/banner";
import { getAbsoluteImgUrl } from "../utils/getAbsoluteImgUrl";

export const getBanners: RequestHandler = async (req, res) => {
    const banners = await getAllBanners();
    const bannersUrlFull = banners.map(banner => ({
        ...banner,
        img: getAbsoluteImgUrl(banner.img)
    }));

    res.json({ error: null, banners: bannersUrlFull })
}