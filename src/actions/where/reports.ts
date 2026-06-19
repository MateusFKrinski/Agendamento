import { Prisma } from "@/generated/prisma";
import { AppointmentReportFilters } from "@/lib/schemas/appointmentReportFilters";
import { TransportReportFilters } from "@/lib/schemas/transportReportFilters";

export function buildAppointmentWhere(
  filters: AppointmentReportFilters,
): Prisma.AppointmentWhereInput {
  const where: Prisma.AppointmentWhereInput = {};

  if (filters.dateFrom || filters.dateTo) {
    where.date = {
      ...(filters.dateFrom && {
        gte: new Date(`${filters.dateFrom}T00:00:00.000Z`),
      }),
      ...(filters.dateTo && {
        lte: new Date(`${filters.dateTo}T23:59:59.999Z`),
      }),
    };
  }

  if (filters.search) {
    where.OR = [
      { patient: { name: { contains: filters.search, mode: "insensitive" } } },
      { patient: { cpf: { contains: filters.search } } },
    ];
  }

  if (filters.specialtyId) where.healthSpecialtyId = filters.specialtyId;
  if (filters.healthUnitId) where.healthUnitId = filters.healthUnitId;
  if (filters.waitingPlaceId) where.waitingPlaceId = filters.waitingPlaceId;
  if (filters.createdById) where.createdById = filters.createdById;

  if (filters.hasCompanion !== undefined) {
    where.hasCompanion = filters.hasCompanion;
  }

  if (filters.status === "canceled") {
    where.isCanceled = true;
  } else if (filters.status === "active") {
    where.isCanceled = false;
  } else if (filters.status === "pending") {
    where.isCanceled = false;
    where.transports = { none: { transport: { isCanceled: false } } };
  } else if (filters.status === "escalated") {
    where.isCanceled = false;
    where.transports = { some: { transport: { isCanceled: false } } };
  }

  return where;
}

export function buildTransportWhere(
  filters: TransportReportFilters,
): Prisma.TransportWhereInput {
  const where: Prisma.TransportWhereInput = {};

  if (filters.dateFrom || filters.dateTo) {
    where.date = {
      ...(filters.dateFrom && {
        gte: new Date(`${filters.dateFrom}T00:00:00.000Z`),
      }),
      ...(filters.dateTo && {
        lte: new Date(`${filters.dateTo}T23:59:59.999Z`),
      }),
    };
  }

  if (filters.vehicleId) where.vehicleId = filters.vehicleId;
  if (filters.driverId) where.driverId = filters.driverId;
  if (filters.createdById) where.createdById = filters.createdById;

  if (filters.status === "active") where.isCanceled = false;
  if (filters.status === "canceled") where.isCanceled = true;

  return where;
}
