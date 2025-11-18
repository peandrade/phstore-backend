import z from "zod";

export const getRelatedProductSchema = z.object({
    id: z.coerce.number().positive().int()
});