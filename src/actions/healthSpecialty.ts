"use server";

import { prisma } from "@/lib/prisma";
import { withPermission, withAllPermissions } from "@/lib/auth/guard";
import { createResult, ActionResult } from "@/lib/action-result";
import {
  createHealthSpecialtySchema,
  updateHealthSpecialtySchema,
} from "@/lib/schemas/healthSpecialty";
import { Prisma } from "@/generated/prisma";
import { HealthSpecialtyRow } from "@/actions/types/healthSpecialty";
import { SPECIALTY_SELECT } from "@/actions/selects/healthSpecialty";

export const listHealthSpecialties = withPermission(
  "read",
  "healthSpecialty",
  async (
    page: number = 1,
    search: string = "",
    limit: number = 10,
  ): Promise<
    ActionResult<{
      specialties: HealthSpecialtyRow[];
      total: number;
      pages: number;
    }>
  > => {
    return createResult(async () => {
      const where: Prisma.HealthSpecialtyWhereInput = {
        ...(search && {
          name: { contains: search, mode: "insensitive" },
        }),
      };

      const [specialties, total] = await Promise.all([
        prisma.healthSpecialty.findMany({
          where,
          select: SPECIALTY_SELECT,
          orderBy: { name: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.healthSpecialty.count({ where }),
      ]);

      return { specialties, total, pages: Math.ceil(total / limit) };
    });
  },
);

export const createHealthSpecialty = withPermission(
  "create",
  "healthSpecialty",
  async (data: unknown): Promise<ActionResult<{ specialtyId: string }>> => {
    return createResult(async () => {
      const parsed = createHealthSpecialtySchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const existing = await prisma.healthSpecialty.findFirst({
        where: { name: parsed.data.name, deletedAt: null },
      });
      if (existing)
        throw new Error("Já existe uma especialidade com esse nome");

      const specialty = await prisma.healthSpecialty.create({
        data: {
          name: parsed.data.name,
          observations: parsed.data.observations,
        },
      });

      return { specialtyId: specialty.id };
    });
  },
);

export const updateHealthSpecialty = withAllPermissions(
  ["read"],
  "healthSpecialty",
  async (id: string, data: unknown): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const parsed = updateHealthSpecialtySchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const existing = await prisma.healthSpecialty.findFirst({
        where: { name: parsed.data.name, NOT: { id } },
      });
      if (existing)
        throw new Error("Já existe uma especialidade com esse nome");

      await prisma.healthSpecialty.update({
        where: { id },
        data: {
          name: parsed.data.name,
          observations: parsed.data.observations,
        },
      });
    });
  },
);

export const deactivateHealthSpecialty = withAllPermissions(
  ["read"],
  "healthSpecialty",
  async (id: string): Promise<ActionResult<void>> => {
    return createResult(async () => {
      await prisma.healthSpecialty.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  },
);

export const reactivateHealthSpecialty = withAllPermissions(
  ["read"],
  "healthSpecialty",
  async (id: string): Promise<ActionResult<void>> => {
    return createResult(async () => {
      await prisma.healthSpecialty.update({
        where: { id },
        data: { deletedAt: null },
      });
    });
  },
);
