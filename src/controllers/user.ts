import { loginSchema } from "@/schemas/loginSchema";
import { registerSchema } from "@/schemas/registerSchema";
import { createUser, loginUser } from "@/services/user";
import { RequestHandler } from "express";

export const register: RequestHandler = async (req, res) => {
  try {
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }
    const { name, email, password } = result.data;
    const user = await createUser(name, email, password);

    if (!user) {
      return res.status(400).json({ error: "Email already exists" });
    }

    res.status(201).json({ user });
  } catch (error) {
    console.error("Error in register User:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: result.error.issues });
    }

    const { email, password } = result.data;
    const token = await loginUser(email, password);
    if (!token) {
      return res.status(401).json({ error: "Access denied" });
    }

    res.json({ token });
  } catch (error) {
    console.error("Error in login User:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
