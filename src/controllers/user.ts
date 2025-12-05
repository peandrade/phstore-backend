import { addAddressSchema } from "@/schemas/addAddressSchema";
import { loginSchema } from "@/schemas/loginSchema";
import { registerSchema } from "@/schemas/registerSchema";
import { createAddress, createUser, loginUser } from "@/services/user";
import { AuthenticatedRequest } from "@/types/express";
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

export const addAddress: RequestHandler = async (req, res) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) return res.status(401).json({ error: "Access denied" });

    const result = addAddressSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: result.error.issues });

    const address = await createAddress(userId, result.data);
    if (!address) return res.status(500).json({ error: "Failed to create address" });

    res.json({ address });
  } catch (error) {
    console.error("Error in address:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
