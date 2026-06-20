"use server";

import { prisma } from "@/lib/prisma";
import { withPermission, withAllPermissions } from "@/lib/auth/guard";
import { createResult, ActionResult } from "@/lib/action-result";
import {
  createWaitingPlaceSchema,
  updateWaitingPlaceSchema,
} from "@/lib/schemas/waitingPlace";
import { Prisma } from "@/generated/prisma";
import { WaitingPlaceRow } from "@/actions/types/waitingPlace";
import { WAITING_PLACE_SELECT } from "@/actions/selects/waitingPlace";

export const listWaitingPlaces = withPermission(
  "read",
  "waitingPlace",
  async (
    page: number = 1,
    search: string = "",
    limit: number = 10,
  ): Promise<
    ActionResult<{
      waitingPlaces: WaitingPlaceRow[];
      total: number;
      pages: number;
    }>
  > => {
    return createResult(async () => {
      const where: Prisma.WaitingPlaceWhereInput = search
        ? { name: { contains: search, mode: "insensitive" } }
        : {};

      const [waitingPlaces, total] = await Promise.all([
        prisma.waitingPlace.findMany({
          where,
          select: WAITING_PLACE_SELECT,
          orderBy: { name: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.waitingPlace.count({ where }),
      ]);

      return { waitingPlaces, total, pages: Math.ceil(total / limit) };
    });
  },
);

export const listAllWaitingPlaces = withPermission(
  "read",
  "waitingPlace",
  async (): Promise<ActionResult<{ waitingPlaces: WaitingPlaceRow[] }>> => {
    return createResult(async () => {
      const waitingPlaces = await prisma.waitingPlace.findMany({
        select: WAITING_PLACE_SELECT,
        orderBy: { name: "asc" },
      });
      return { waitingPlaces };
    });
  },
);

export const createWaitingPlace = withPermission(
  "create",
  "waitingPlace",
  async (data: unknown): Promise<ActionResult<{ waitingPlaceId: string }>> => {
    return createResult(async () => {
      const parsed = createWaitingPlaceSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const existing = await prisma.waitingPlace.findUnique({
        where: { name: parsed.data.name },
      });
      if (existing)
        throw new Error("Já existe um local de espera com esse nome");

      const waitingPlace = await prisma.waitingPlace.create({
        data: { name: parsed.data.name },
      });

      return { waitingPlaceId: waitingPlace.id };
    });
  },
);

export const updateWaitingPlace = withAllPermissions(
  ["read"],
  "waitingPlace",
  async (id: string, data: unknown): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const parsed = updateWaitingPlaceSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const existing = await prisma.waitingPlace.findFirst({
        where: { name: parsed.data.name, NOT: { id } },
      });
      if (existing)
        throw new Error("Já existe um local de espera com esse nome");

      await prisma.waitingPlace.update({
        where: { id },
        data: { name: parsed.data.name },
      });
    });
  },
);

export const deleteWaitingPlace = withAllPermissions(
  ["read"],
  "waitingPlace",
  async (id: string): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const hasAppointments = await prisma.appointment.count({
        where: { waitingPlaceId: id },
      });
      if (hasAppointments > 0) {
        throw new Error(
          "Não é possível remover um local de espera com agendamentos vinculados",
        );
      }

      await prisma.waitingPlace.delete({ where: { id } });
    });
  },
);
