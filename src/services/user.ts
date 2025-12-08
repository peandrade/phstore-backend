import { prisma } from "@/lib/prisma";
import { Address } from "@/types";
import { compare, hash } from "bcryptjs";
import { v4 } from "uuid";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiresIn,
} from "@/lib/jwt";

export const createUser = async (name: string, email: string, password: string) => {
  const emailLower = email.toLowerCase();
  const existing = await prisma.user.findUnique({
    where: { email: emailLower },
  });
  if (existing) return null;
  const hashPassword = await hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email: emailLower,
      password: hashPassword,
    },
  });
  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
};

export const loginUser = async (email: string, password: string) => {
  const emailLower = email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email: emailLower } });
  if (!user) return null;

  const hasPassword = await compare(password, user.password);
  if (!hasPassword) return null;

  // Generate tokens
  const accessToken = generateAccessToken(user.id, user.email);
  const tokenId = v4();
  const refreshToken = generateRefreshToken(user.id, user.email, tokenId);

  // Store refresh token in database
  const expiresAt = new Date(Date.now() + getRefreshTokenExpiresIn() * 1000);
  await prisma.refreshToken.create({
    data: {
      id: tokenId,
      userId: user.id,
      token: refreshToken,
      expiresAt,
    },
  });

  return { accessToken, refreshToken };
};

export const refreshAccessToken = async (refreshToken: string) => {
  // Verify refresh token
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) return null;

  // Check if token exists in database and is not expired
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    return null;
  }

  // Check if token is blacklisted
  const blacklisted = await prisma.tokenBlacklist.findUnique({
    where: { token: refreshToken },
  });

  if (blacklisted) return null;

  // Generate new access token
  const accessToken = generateAccessToken(storedToken.user.id, storedToken.user.email);

  return { accessToken };
};

export const logoutUser = async (refreshToken: string) => {
  try {
    // Add refresh token to blacklist
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });

    if (!storedToken) return true;

    await prisma.tokenBlacklist.create({
      data: {
        token: refreshToken,
        expiresAt: storedToken.expiresAt,
      },
    });

    // Optionally delete the refresh token from database
    await prisma.refreshToken.delete({
      where: { token: refreshToken },
    });

    return true;
  } catch (_error) {
    return false;
  }
};

export const revokeAllUserTokens = async (userId: number) => {
  try {
    // Get all user refresh tokens
    const tokens = await prisma.refreshToken.findMany({
      where: { userId },
    });

    // Add all tokens to blacklist
    for (const token of tokens) {
      await prisma.tokenBlacklist.create({
        data: {
          token: token.token,
          expiresAt: token.expiresAt,
        },
      });
    }

    // Delete all user refresh tokens
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    return true;
  } catch (_error) {
    return false;
  }
};

export const isTokenBlacklisted = async (token: string): Promise<boolean> => {
  const blacklisted = await prisma.tokenBlacklist.findUnique({
    where: { token },
  });

  return !!blacklisted && blacklisted.expiresAt > new Date();
};

export const createAddress = async (userId: number, address: Address) => {
  return await prisma.userAddress.create({
    data: {
      ...address,
      userId,
    },
  });
};

export const getAddressesByUserId = async (userId: number) => {
  return await prisma.userAddress.findMany({
    where: { userId },
    select: {
      id: true,
      zipcode: true,
      street: true,
      number: true,
      city: true,
      state: true,
      country: true,
      complement: true,
    },
  });
};

export const getAddressesById = async (userId: number, addressId: number) => {
  return prisma.userAddress.findFirst({
    where: { id: addressId, userId },
    select: {
      id: true,
      zipcode: true,
      street: true,
      number: true,
      city: true,
      state: true,
      country: true,
      complement: true,
    },
  });
};
