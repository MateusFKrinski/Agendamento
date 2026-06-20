"use server";

import { prisma } from "@/lib/prisma";
import { withPermission, withAllPermissions } from "@/lib/auth/guard";
import { createResult, ActionResult } from "@/lib/action-result";
import { createDriverSchema, updateDriverSchema } from "@/lib/schemas/driver";
import { paymentMethodSchema } from "@/lib/schemas/fields/paymentMethodSchema";
import { Prisma } from "@/generated/prisma";
import { DRIVER_SELECT } from "@/actions/selects/driver";
import { DriverRow } from "@/actions/types/driver";

export const listDrivers = withPermission(
  "read",
  "driver",
  async (
    page: number = 1,
    search: string = "",
    limit: number = 10,
  ): Promise<
    ActionResult<{ drivers: DriverRow[]; total: number; pages: number }>
  > => {
    return createResult(async () => {
      const where: Prisma.DriverWhereInput = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { cpf: { contains: search } },
          ],
        }),
      };

      const [drivers, total] = await Promise.all([
        prisma.driver.findMany({
          where,
          select: DRIVER_SELECT,
          orderBy: { name: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.driver.count({ where }),
      ]);

      return { drivers, total, pages: Math.ceil(total / limit) };
    });
  },
);

export const createDriver = withPermission(
  "create",
  "driver",
  async (data: unknown): Promise<ActionResult<{ driverId: string }>> => {
    return createResult(async () => {
      const parsed = createDriverSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const existing = await prisma.driver.findFirst({
        where: { cpf: parsed.data.cpf, deletedAt: null },
      });
      if (existing)
        throw new Error("Já existe um motorista cadastrado com esse CPF");

      const driver = await prisma.driver.create({
        data: {
          name: parsed.data.name,
          cpf: parsed.data.cpf,
          rg: parsed.data.rg,
          role: parsed.data.role,
          birthDate: new Date(parsed.data.birthDate),
          phone: parsed.data.phone,
          observations: parsed.data.observations,
          cnhNumber: parsed.data.cnhNumber,
          cnhCategory: parsed.data.cnhCategory,
          cnhExpiration: new Date(parsed.data.cnhExpiration),
          paymentMethods: {
            create: parsed.data.paymentMethods.map((pm) => ({
              label: pm.label,
              bankName: pm.bankName,
              bankAgency: pm.bankAgency,
              bankAccount: pm.bankAccount,
              pixKeyType: pm.pixKeyType,
              pixKey: pm.pixKey,
            })),
          },
        },
      });

      return { driverId: driver.id };
    });
  },
);

export const updateDriver = withAllPermissions(
  ["read"],
  "driver",
  async (id: string, data: unknown): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const parsed = updateDriverSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const existing = await prisma.driver.findFirst({
        where: { cpf: parsed.data.cpf, NOT: { id } },
      });
      if (existing)
        throw new Error("Já existe um motorista cadastrado com esse CPF");

      await prisma.driver.update({
        where: { id },
        data: {
          name: parsed.data.name,
          cpf: parsed.data.cpf,
          rg: parsed.data.rg,
          role: parsed.data.role,
          birthDate: new Date(parsed.data.birthDate),
          phone: parsed.data.phone,
          observations: parsed.data.observations,
          cnhNumber: parsed.data.cnhNumber,
          cnhCategory: parsed.data.cnhCategory,
          cnhExpiration: new Date(parsed.data.cnhExpiration),
        },
      });
    });
  },
);

export const deactivateDriver = withAllPermissions(
  ["read"],
  "driver",
  async (id: string): Promise<ActionResult<void>> => {
    return createResult(async () => {
      await prisma.driver.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  },
);

export const reactivateDriver = withAllPermissions(
  ["read"],
  "driver",
  async (id: string): Promise<ActionResult<void>> => {
    return createResult(async () => {
      await prisma.driver.update({
        where: { id },
        data: { deletedAt: null },
      });
    });
  },
);

export const addPaymentMethod = withAllPermissions(
  ["read"],
  "driver",
  async (
    driverId: string,
    data: unknown,
  ): Promise<ActionResult<{ paymentMethodId: string }>> => {
    return createResult(async () => {
      const parsed = paymentMethodSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const paymentMethod = await prisma.paymentMethod.create({
        data: {
          driverId,
          label: parsed.data.label,
          bankName: parsed.data.bankName,
          bankAgency: parsed.data.bankAgency,
          bankAccount: parsed.data.bankAccount,
          pixKeyType: parsed.data.pixKeyType,
          pixKey: parsed.data.pixKey,
        },
      });

      return { paymentMethodId: paymentMethod.id };
    });
  },
);

export const updatePaymentMethod = withAllPermissions(
  ["read"],
  "driver",
  async (id: string, data: unknown): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const parsed = paymentMethodSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      await prisma.paymentMethod.update({
        where: { id },
        data: {
          label: parsed.data.label,
          bankName: parsed.data.bankName,
          bankAgency: parsed.data.bankAgency,
          bankAccount: parsed.data.bankAccount,
          pixKeyType: parsed.data.pixKeyType,
          pixKey: parsed.data.pixKey,
        },
      });
    });
  },
);

export const deletePaymentMethod = withAllPermissions(
  ["read"],
  "driver",
  async (id: string): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const count = await prisma.paymentMethod.count({
        where: {
          driverId: (
            await prisma.paymentMethod.findUniqueOrThrow({ where: { id } })
          ).driverId,
        },
      });

      if (count <= 1) {
        throw new Error(
          "O motorista precisa ter ao menos um método de pagamento",
        );
      }

      await prisma.paymentMethod.delete({ where: { id } });
    });
  },
);
