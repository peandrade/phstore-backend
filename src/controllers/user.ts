import { registerSchema } from "@/schemas/registerSchema";
import { createUser } from "@/services/user";
import { RequestHandler } from "express";

export const register: RequestHandler = async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    const { name, email, password } = result.data;
    const user = await createUser(name, email, password);

    if(!user) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    res.status(201).json({ user });
  } catch (error) {
    console.error("Error in register User:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
