import { prisma } from "@/lib/prisma";
import type { Action, Resource } from "@/lib/permissions";

export async function getUserPermissions(userId: string): Promise<Set<string>> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  const perms = new Set<string>();
  for (const { role } of userRoles) {
    for (const { permission } of role.permissions) {
      perms.add(`${permission.action}:${permission.resource}`);
    }
  }

  return perms;
}

export async function hasPermission(
  userId: string,
  action: Action,
  resource: Resource,
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (user?.isAdmin) return true;

  const perms = await getUserPermissions(userId);
  return perms.has(`${action}:${resource}`);
}

export async function hasAllPermissions(
  userId: string,
  actions: Action[],
  resource: Resource,
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (user?.isAdmin) return true;

  const perms = await getUserPermissions(userId);
  return actions.every((action) => perms.has(`${action}:${resource}`));
}
