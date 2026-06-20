"use server";

import { prisma } from "@/lib/prisma";
import { withPermission, withAllPermissions } from "@/lib/auth/guard";
import { createResult, ActionResult } from "@/lib/action-result";
import {
  createVehicleSchema,
  updateVehicleSchema,
} from "@/lib/schemas/vehicle";
import { Prisma } from "@/generated/prisma";
import { VehicleRow } from "@/actions/types/vehicle";
import { VEHICLE_SELECT } from "@/actions/selects/vehicle";

export const listVehicles = withPermission(
  "read",
  "vehicle",
  async (
    page: number = 1,
    search: string = "",
    limit: number = 10,
  ): Promise<
    ActionResult<{ vehicles: VehicleRow[]; total: number; pages: number }>
  > => {
    return createResult(async () => {
      const where: Prisma.VehicleWhereInput = {
        ...(search && {
          OR: [
            { plate: { contains: search, mode: "insensitive" } },
            { model: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
          ],
        }),
      };

      const [vehicles, total] = await Promise.all([
        prisma.vehicle.findMany({
          where,
          select: VEHICLE_SELECT,
          orderBy: { plate: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.vehicle.count({ where }),
      ]);

      return { vehicles, total, pages: Math.ceil(total / limit) };
    });
  },
);

export const createVehicle = withPermission(
  "create",
  "vehicle",
  async (data: unknown): Promise<ActionResult<{ vehicleId: string }>> => {
    return createResult(async () => {
      const parsed = createVehicleSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const existing = await prisma.vehicle.findFirst({
        where: { plate: parsed.data.plate, deletedAt: null },
      });
      if (existing)
        throw new Error("Já existe um veículo cadastrado com essa placa");

      const vehicle = await prisma.vehicle.create({
        data: {
          plate: parsed.data.plate,
          model: parsed.data.model,
          brand: parsed.data.brand,
          year: parsed.data.year,
          color: parsed.data.color,
          capacity: parsed.data.capacity,
          observations: parsed.data.observations,
        },
      });

      return { vehicleId: vehicle.id };
    });
  },
);

export const updateVehicle = withAllPermissions(
  ["read"],
  "vehicle",
  async (id: string, data: unknown): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const parsed = updateVehicleSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const existing = await prisma.vehicle.findFirst({
        where: { plate: parsed.data.plate, NOT: { id } },
      });
      if (existing)
        throw new Error("Já existe um veículo cadastrado com essa placa");

      await prisma.vehicle.update({
        where: { id },
        data: {
          plate: parsed.data.plate,
          model: parsed.data.model,
          brand: parsed.data.brand,
          year: parsed.data.year,
          color: parsed.data.color,
          capacity: parsed.data.capacity,
          observations: parsed.data.observations,
        },
      });
    });
  },
);

export const deactivateVehicle = withAllPermissions(
  ["read"],
  "vehicle",
  async (id: string): Promise<ActionResult<void>> => {
    return createResult(async () => {
      await prisma.vehicle.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  },
);

export const reactivateVehicle = withAllPermissions(
  ["read"],
  "vehicle",
  async (id: string): Promise<ActionResult<void>> => {
    return createResult(async () => {
      await prisma.vehicle.update({
        where: { id },
        data: { deletedAt: null },
      });
    });
  },
);
