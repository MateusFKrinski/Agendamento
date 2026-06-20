"use server";

import { prisma } from "@/lib/prisma";
import { withPermission, withAllPermissions } from "@/lib/auth/guard";
import { createResult, ActionResult } from "@/lib/action-result";
import {
  createHealthUnitSchema,
  updateHealthUnitSchema,
} from "@/lib/schemas/healthUnit";
import { Prisma } from "@/generated/prisma";
import { HealthUnitRow } from "@/actions/types/healthUnit";
import { HEALTH_UNIT_SELECT } from "@/actions/selects/healthUnit";

export const listHealthUnits = withPermission(
  "read",
  "healthUnit",
  async (
    page: number = 1,
    search: string = "",
    limit: number = 10,
  ): Promise<
    ActionResult<{ units: HealthUnitRow[]; total: number; pages: number }>
  > => {
    return createResult(async () => {
      const where: Prisma.HealthUnitWhereInput = {
        ...(search && {
          OR: [
            { unitName: { contains: search, mode: "insensitive" } },
            { cnpj: { contains: search } },
          ],
        }),
      };

      const [units, total] = await Promise.all([
        prisma.healthUnit.findMany({
          where,
          select: HEALTH_UNIT_SELECT,
          orderBy: { unitName: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.healthUnit.count({ where }),
      ]);

      return { units, total, pages: Math.ceil(total / limit) };
    });
  },
);

export const createHealthUnit = withPermission(
  "create",
  "healthUnit",
  async (data: unknown): Promise<ActionResult<{ unitId: string }>> => {
    return createResult(async () => {
      const parsed = createHealthUnitSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const existing = await prisma.healthUnit.findFirst({
        where: { cnpj: parsed.data.cnpj, deletedAt: null },
      });
      if (existing) throw new Error("Já existe uma unidade com esse CNPJ");

      const { address, ...rest } = parsed.data;

      const unit = await prisma.healthUnit.create({
        data: {
          ...rest,
          address: {
            create: {
              ...address,
            },
          },
        },
      });

      return { unitId: unit.id };
    });
  },
);

export const updateHealthUnit = withAllPermissions(
  ["read"],
  "healthUnit",
  async (id: string, data: unknown): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const parsed = updateHealthUnitSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const existing = await prisma.healthUnit.findFirst({
        where: { cnpj: parsed.data.cnpj, NOT: { id } },
      });
      if (existing) throw new Error("Já existe uma unidade com esse CNPJ");

      const { address, ...rest } = parsed.data;

      await prisma.healthUnit.update({
        where: { id },
        data: {
          ...rest,
          address: {
            update: {
              ...address,
            },
          },
        },
      });
    });
  },
);

export const deactivateHealthUnit = withAllPermissions(
  ["read"],
  "healthUnit",
  async (id: string): Promise<ActionResult<void>> => {
    return createResult(async () => {
      await prisma.healthUnit.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  },
);

export const reactivateHealthUnit = withAllPermissions(
  ["read"],
  "healthUnit",
  async (id: string): Promise<ActionResult<void>> => {
    return createResult(async () => {
      await prisma.healthUnit.update({
        where: { id },
        data: { deletedAt: null },
      });
    });
  },
);
