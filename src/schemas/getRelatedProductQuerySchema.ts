import z from "zod";

export const getRelatedProductQuerySchema = z.object({
  limit: z.coerce.number().positive().int().optional(),
});
