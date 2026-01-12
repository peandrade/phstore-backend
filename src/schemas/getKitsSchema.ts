import z from "zod";

export const getKitsSchema = z.object({
  limit: z.coerce.number().positive().int().optional(),
  orderBy: z.enum(["price", "discount", "newest"]).optional(),
});

export const getOneKitSchema = z.object({
  id: z.coerce.number().positive().int(),
});

export const getKitBySlugSchema = z.object({
  slug: z.string(),
});