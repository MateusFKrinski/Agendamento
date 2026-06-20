import { Prisma } from "@/generated/prisma";
import { VEHICLE_SELECT } from "@/actions/selects/vehicle";

export type VehicleRow = Prisma.VehicleGetPayload<{
  select: typeof VEHICLE_SELECT;
}>;
