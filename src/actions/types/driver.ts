import { Prisma } from "@/generated/prisma";
import { DRIVER_SELECT } from "@/actions/selects/driver";

export type DriverRow = Prisma.DriverGetPayload<{
  select: typeof DRIVER_SELECT;
}>;
