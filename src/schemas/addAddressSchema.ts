import z from "zod";

export const addAddressSchema = z.object({
  zipcode: z
    .string()
    .min(3, "Zipcode must be at least 3 characters")
    .max(20, "Zipcode must not exceed 20 characters")
    .trim(),
  street: z
    .string()
    .min(1, "Street is required")
    .max(255, "Street must not exceed 255 characters")
    .trim(),
  number: z
    .string()
    .min(1, "Number is required")
    .max(20, "Number must not exceed 20 characters")
    .trim(),
  city: z
    .string()
    .min(1, "City is required")
    .max(100, "City must not exceed 100 characters")
    .trim(),
  state: z
    .string()
    .min(2, "State must be at least 2 characters")
    .max(100, "State must not exceed 100 characters")
    .trim(),
  country: z
    .string()
    .min(2, "Country must be at least 2 characters")
    .max(100, "Country must not exceed 100 characters")
    .trim(),
  complement: z.string().max(255, "Complement must not exceed 255 characters").trim().optional(),
});
