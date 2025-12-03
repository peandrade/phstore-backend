import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";

export const createUser = async (
  name: string,
  email: string,
  password: string
) => {
  const emailLower = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: emailLower } });
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
