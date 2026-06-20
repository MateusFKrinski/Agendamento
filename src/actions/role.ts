"use server";

import { prisma } from "@/lib/prisma";
import { withPermission } from "@/lib/auth/guard";
import { createResult, ActionResult } from "@/lib/action-result";
import {
  createRoleSchema,
  updateRolePermissionsSchema,
  assignRoleSchema,
} from "@/lib/schemas/role";
import { Prisma } from "@/generated/prisma";

export const listRoles = withPermission(
  "read",
  "user",
  async (): Promise<
    ActionResult<{
      roles: Prisma.RoleGetPayload<{
        include: {
          permissions: { include: { permission: true } };
          users: { include: { user: { select: { id: true; name: true } } } };
        };
      }>[];
    }>
  > => {
    return createResult(async () => {
      const roles = await prisma.role.findMany({
        include: {
          permissions: { include: { permission: true } },
          users: { include: { user: { select: { id: true, name: true } } } },
        },
        orderBy: { name: "asc" },
      });
      return { roles };
    });
  },
);

export const createRole = withPermission(
  "create",
  "user",
  async (data: unknown): Promise<ActionResult<{ roleId: string }>> => {
    return createResult(async () => {
      const parsed = createRoleSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const existing = await prisma.role.findUnique({
        where: { name: parsed.data.name },
      });
      if (existing) throw new Error("Já existe uma role com esse nome");

      const role = await prisma.role.create({
        data: { name: parsed.data.name },
      });

      return { roleId: role.id };
    });
  },
);

export const updateRolePermissions = withPermission(
  "update",
  "user",
  async (
    roleId: string,
    data: { permissionKeys: string[] },
  ): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const parsed = updateRolePermissionsSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const permissionPairs = parsed.data.permissionKeys.map((key) => {
        const [action, resource] = key.split(":");
        return { action, resource };
      });

      await Promise.all(
        permissionPairs.map((entry) =>
          prisma.permission.upsert({
            where: {
              action_resource: {
                action: entry.action,
                resource: entry.resource,
              },
            },
            update: {},
            create: { action: entry.action, resource: entry.resource },
          }),
        ),
      );

      const permissions = await prisma.permission.findMany({
        where: { OR: permissionPairs },
      });

      await prisma.rolePermission.deleteMany({ where: { roleId } });
      await prisma.rolePermission.createMany({
        data: permissions.map((p) => ({ roleId, permissionId: p.id })),
      });
    });
  },
);

export const deleteRole = withPermission(
  "delete",
  "user",
  async (roleId: string): Promise<ActionResult<void>> => {
    return createResult(async () => {
      await prisma.rolePermission.deleteMany({ where: { roleId } });
      await prisma.userRole.deleteMany({ where: { roleId } });
      await prisma.role.delete({ where: { id: roleId } });
    });
  },
);

export const assignRoleToUser = withPermission(
  "update",
  "user",
  async (
    userId: string,
    data: { roleId: string },
  ): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const parsed = assignRoleSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const existing = await prisma.userRole.findUnique({
        where: { userId_roleId: { userId, roleId: parsed.data.roleId } },
      });
      if (existing) throw new Error("Usuário já possui essa role");

      await prisma.userRole.create({
        data: { userId, roleId: parsed.data.roleId },
      });
    });
  },
);

export const removeRoleFromUser = withPermission(
  "update",
  "user",
  async (userId: string, roleId: string): Promise<ActionResult<void>> => {
    return createResult(async () => {
      await prisma.userRole.delete({
        where: { userId_roleId: { userId, roleId } },
      });
    });
  },
);

export const listUsersWithRoles = withPermission(
  "read",
  "user",
  async (): Promise<
    ActionResult<{
      users: Prisma.UserGetPayload<{
        select: {
          id: true;
          name: true;
          username: true;
          isAdmin: true;
          roles: { include: { role: true } };
        };
      }>[];
    }>
  > => {
    return createResult(async () => {
      const users = await prisma.user.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          username: true,
          isAdmin: true,
          roles: { include: { role: true } },
        },
        orderBy: { name: "asc" },
      });
      return { users };
    });
  },
);
