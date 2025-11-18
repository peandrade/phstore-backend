import z from "zod";

export const getOneProductSchema = z.object({
    id: z.coerce.number().positive().int()
});