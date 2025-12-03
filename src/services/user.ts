import { prisma } from "@/lib/prisma";
import { compare, hash } from "bcryptjs";
import { v4 } from "uuid";

export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
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

  const token = v4();
  await prisma.user.update({
    where: { id: user.id },
    data: { token },
  });

  return token;
};
