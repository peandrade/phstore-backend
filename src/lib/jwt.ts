import jwt from "jsonwebtoken";
import { validateEnv } from "@/utils/validateEnv";

const JWT_SECRET = validateEnv("JWT_SECRET") as string;
const JWT_REFRESH_SECRET = validateEnv("JWT_REFRESH_SECRET") as string;

const ACCESS_TOKEN_EXPIRES_IN = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRES_IN = "7d"; // 7 days

export interface TokenPayload {
  userId: number;
  email: string;
}

export interface AccessTokenPayload extends TokenPayload {
  type: "access";
}

export interface RefreshTokenPayload extends TokenPayload {
  type: "refresh";
  tokenId: string;
}

/**
 * Generate an access token (short-lived)
 */
export const generateAccessToken = (userId: number, email: string): string => {
  const payload: AccessTokenPayload = {
    userId,
    email,
    type: "access",
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
};

/**
 * Generate a refresh token (long-lived)
 */
export const generateRefreshToken = (userId: number, email: string, tokenId: string): string => {
  const payload: RefreshTokenPayload = {
    userId,
    email,
    type: "refresh",
    tokenId,
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
  });
};

/**
 * Verify and decode an access token
 */
export const verifyAccessToken = (token: string): AccessTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AccessTokenPayload;
    if (decoded.type !== "access") return null;
    return decoded;
  } catch (_error) {
    return null;
  }
};

/**
 * Verify and decode a refresh token
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload | null => {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as RefreshTokenPayload;
    if (decoded.type !== "refresh") return null;
    return decoded;
  } catch (_error) {
    return null;
  }
};

/**
 * Get token expiration time in seconds
 */
export const getAccessTokenExpiresIn = (): number => {
  return 15 * 60; // 15 minutes in seconds
};

export const getRefreshTokenExpiresIn = (): number => {
  return 7 * 24 * 60 * 60; // 7 days in seconds
};
