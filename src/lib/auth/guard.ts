import { getServerSession } from "next-auth";
import { hasPermission, hasAllPermissions } from "./permissions";
import { fail, ActionResult } from "@/lib/action-result";
import type { Action, Resource } from "@/lib/permissions";
import { authOptions } from "@/lib/auth/auth";

export function withPermission<TArgs extends unknown[], TData>(
  action: Action,
  resource: Resource,
  fn: (...args: TArgs) => Promise<ActionResult<TData>>,
): (...args: TArgs) => Promise<ActionResult<TData>> {
  return async (...args: TArgs) => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) return fail("Não autenticado");

    const allowed = await hasPermission(session.user.id, action, resource);
    if (!allowed) return fail("Sem permissão para esta ação");

    return fn(...args);
  };
}

export function withAllPermissions<TArgs extends unknown[], TData>(
  actions: Action[],
  resource: Resource,
  fn: (...args: TArgs) => Promise<ActionResult<TData>>,
): (...args: TArgs) => Promise<ActionResult<TData>> {
  return async (...args: TArgs) => {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) return fail("Não autenticado");

    const allowed = await hasAllPermissions(session.user.id, actions, resource);
    if (!allowed) return fail("Sem permissão para esta ação");

    return fn(...args);
  };
}
