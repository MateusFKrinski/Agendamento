"use server";

import { prisma } from "@/lib/prisma";
import { withPermission, withAllPermissions } from "@/lib/auth/guard";
import {
  createUserSchema,
  updateUserSchema,
  resetUserPasswordSchema,
} from "@/lib/schemas/user";
import bcrypt from "bcrypt";
import { Prisma } from "@/generated/prisma";
import { ActionResult, createResult } from "@/lib/action-result";

export const createUser = withPermission(
  "create",
  "user",
  async (data: unknown): Promise<ActionResult<{ userId: string }>> => {
    return createResult(async () => {
      const parsed = createUserSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const existing = await prisma.user.findUnique({
        where: { username: parsed.data.username },
      });
      if (existing) throw new Error("Nome de usuário já está em uso");

      const hash = await bcrypt.hash(parsed.data.password, 12);

      const user = await prisma.user.create({
        data: {
          name: parsed.data.name,
          username: parsed.data.username,
          hashPassword: hash,
          isAdmin: parsed.data.isAdmin,
          firstLogin: true,
        },
      });

      return { userId: user.id };
    });
  },
);

export const listUsers = withPermission(
  "read",
  "user",
  async (): Promise<
    ActionResult<{
      users: Prisma.UserGetPayload<{
        omit: {
          hashPassword: true;
          updatedAt: true;
          lastPasswordChangedAt: true;
        };
      }>[];
    }>
  > => {
    return createResult(async () => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          isAdmin: true,
          firstLogin: true,
          passwordResetRequired: true,
          createdAt: true,
          deletedAt: true,
        },
        orderBy: { name: "asc" },
      });

      return { users };
    });
  },
);

export const updateUser = withAllPermissions(
  ["read", "update"],
  "user",
  async (
    id: Prisma.UserWhereUniqueInput["id"],
    data: unknown,
  ): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const parsed = updateUserSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const existing = await prisma.user.findFirst({
        where: { username: parsed.data.username, NOT: { id } },
      });
      if (existing) throw new Error("Nome de usuário já está em uso");

      await prisma.user.update({
        where: { id },
        data: {
          name: parsed.data.name,
          username: parsed.data.username,
          isAdmin: parsed.data.isAdmin,
        },
      });
    });
  },
);

export const resetUserPassword = withAllPermissions(
  ["read", "update"],
  "user",
  async (
    id: Prisma.UserWhereUniqueInput["id"],
    data: unknown,
  ): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const parsed = resetUserPasswordSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const hash = await bcrypt.hash(parsed.data.password, 12);

      await prisma.user.update({
        where: { id },
        data: {
          hashPassword: hash,
          passwordResetRequired: true,
          firstLogin: false,
        },
      });
    });
  },
);

export const deactivateUser = withAllPermissions(
  ["read", "delete"],
  "user",
  async (
    id: Prisma.UserWhereUniqueInput["id"],
  ): Promise<ActionResult<void>> => {
    return createResult(async () => {
      await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  },
);

export const reactivateUser = withAllPermissions(
  ["read", "update"],
  "user",
  async (
    id: Prisma.UserWhereUniqueInput["id"],
  ): Promise<ActionResult<void>> => {
    return createResult(async () => {
      await prisma.user.update({
        where: { id },
        data: { deletedAt: null },
      });
    });
  },
);
