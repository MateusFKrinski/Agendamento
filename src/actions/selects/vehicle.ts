import { Prisma } from "@/generated/prisma";

export const VEHICLE_SELECT = {
  id: true,
  plate: true,
  model: true,
  brand: true,
  year: true,
  color: true,
  capacity: true,
  observations: true,
  deletedAt: true,
} satisfies Prisma.VehicleSelect;
