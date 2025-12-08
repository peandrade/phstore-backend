import { verifyAccessToken } from "@/lib/jwt";
import { AuthenticatedRequest } from "@/types/express";
import { NextFunction, Request, Response } from "express";
import { logger } from "@/lib/logger";

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({ error: "Access denied. No token provided" });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. Invalid token format" });
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const payload = verifyAccessToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Access denied. Invalid or expired token" });
    }

    // Check if token is blacklisted (for access tokens we check by comparing with refresh token blacklist)
    // Note: Access tokens are short-lived, so we don't maintain a separate blacklist for them
    // They will expire naturally within 15 minutes

    (req as AuthenticatedRequest).userId = payload.userId;
    next();
  } catch (error) {
    logger.error({ error }, "Error in auth middleware");
    return res.status(401).json({ error: "Access denied" });
  }
};
