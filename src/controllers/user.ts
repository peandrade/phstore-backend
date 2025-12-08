import { addAddressSchema } from "@/schemas/addAddressSchema";
import { loginSchema } from "@/schemas/loginSchema";
import { registerSchema } from "@/schemas/registerSchema";
import {
  createAddress,
  createUser,
  getAddressesByUserId,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "@/services/user";
import { AuthenticatedRequest } from "@/types/express";
import { RequestHandler } from "express";
import { ConflictError, UnauthorizedError, InternalServerError } from "@/lib/errors";

export const register: RequestHandler = async (req, res, next) => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);
    const user = await createUser(name, email, password);

    if (!user) {
      throw new ConflictError("Email already exists");
    }

    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const tokens = await loginUser(email, password);

    if (!tokens) {
      throw new UnauthorizedError("Invalid email or password");
    }

    res.json({
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== "string") {
      throw new UnauthorizedError("Refresh token is required");
    }

    const result = await refreshAccessToken(refreshToken);

    if (!result) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    res.json({ accessToken: result.accessToken });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken || typeof refreshToken !== "string") {
      throw new UnauthorizedError("Refresh token is required");
    }

    const success = await logoutUser(refreshToken);

    if (!success) {
      throw new InternalServerError("Failed to logout");
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    next(error);
  }
};

export const addAddress: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) throw new UnauthorizedError("Access denied");

    const addressData = addAddressSchema.parse(req.body);
    const address = await createAddress(userId, addressData);

    if (!address) {
      throw new InternalServerError("Failed to create address");
    }

    res.json({ address });
  } catch (error) {
    next(error);
  }
};

export const getAddresses: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    if (!userId) throw new UnauthorizedError("Access denied");

    const addresses = await getAddressesByUserId(userId);
    res.json({ addresses });
  } catch (error) {
    next(error);
  }
};
