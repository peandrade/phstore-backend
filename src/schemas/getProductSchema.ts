import z from "zod";

export const getProductSchema = z.object({
  metadata: z.string().optional(),
  orderBy: z.enum(["views", "selling", "price"]).optional(),
  limit: z.coerce.number().positive().int().optional(),
});
