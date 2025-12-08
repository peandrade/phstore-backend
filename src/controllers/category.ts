import { getCategoryBySlug, getCategoryMetadata } from "@/services/category";
import { RequestHandler } from "express";

export const getCategoryWithMetadata: RequestHandler = async (req, res) => {
  const { slug } = req.params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }

  const metadata = await getCategoryMetadata(category.id);

  res.json({ category, metadata });
};
