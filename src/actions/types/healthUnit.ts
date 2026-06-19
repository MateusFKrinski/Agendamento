import { Prisma } from "@/generated/prisma";
import { HEALTH_UNIT_SELECT } from "@/actions/selects/healthUnit";

export type HealthUnitRow = Prisma.HealthUnitGetPayload<{
  select: typeof HEALTH_UNIT_SELECT;
}>;
