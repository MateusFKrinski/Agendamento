"use server";

import { prisma } from "@/lib/prisma";
import { createResult, ActionResult } from "@/lib/action-result";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { updateMeSchema, changeMyPasswordSchema } from "@/lib/schemas/me";
import bcrypt from "bcrypt";
import { Prisma } from "@/generated/prisma";

export type MeRow = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    username: true;
    isAdmin: true;
    firstLogin: true;
    passwordResetRequired: true;
    createdAt: true;
  };
}>;

export async function getMe(): Promise<ActionResult<{ user: MeRow }>> {
  return createResult(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Não autenticado");

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        username: true,
        isAdmin: true,
        firstLogin: true,
        passwordResetRequired: true,
        createdAt: true,
      },
    });

    if (!user) throw new Error("Usuário não encontrado");
    return { user };
  });
}

export async function updateMe(data: unknown): Promise<ActionResult<void>> {
  return createResult(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Não autenticado");

    const parsed = updateMeSchema.safeParse(data);
    if (!parsed.success)
      throw new Error(parsed.error.issues.map((i) => i.message).join(", "));

    const existing = await prisma.user.findFirst({
      where: { username: parsed.data.username, NOT: { id: session.user.id } },
    });
    if (existing) throw new Error("Nome de usuário já está em uso");

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: parsed.data.name,
        username: parsed.data.username,
      },
    });
  });
}

export async function changeMyPassword(
  data: unknown,
): Promise<ActionResult<void>> {
  return createResult(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Não autenticado");

    const parsed = changeMyPasswordSchema.safeParse(data);
    if (!parsed.success)
      throw new Error(parsed.error.issues.map((i) => i.message).join(", "));

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { hashPassword: true },
    });
    if (!user) throw new Error("Usuário não encontrado");

    const isValid = await bcrypt.compare(
      parsed.data.currentPassword,
      user.hashPassword,
    );
    if (!isValid) throw new Error("Senha atual incorreta");

    const hash = await bcrypt.hash(parsed.data.newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        hashPassword: hash,
        passwordResetRequired: false,
        lastPasswordChangedAt: new Date(),
      },
    });
  });
}
