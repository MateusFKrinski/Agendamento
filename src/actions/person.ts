"use server";

import { prisma } from "@/lib/prisma";
import { withPermission, withAllPermissions } from "@/lib/auth/guard";
import { createResult, ActionResult } from "@/lib/action-result";
import { createPersonSchema, updatePersonSchema } from "@/lib/schemas/person";
import { Prisma } from "@/generated/prisma";
import { PersonRow } from "@/actions/types/person";
import { PERSON_SELECT } from "@/actions/selects/person";

export const listPeople = withPermission(
  "read",
  "person",
  async (
    page: number = 1,
    search: string = "",
    limit: number = 10,
  ): Promise<
    ActionResult<{ people: PersonRow[]; total: number; pages: number }>
  > => {
    return createResult(async () => {
      const where: Prisma.PersonWhereInput = {
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { cpf: { contains: search } },
          ],
        }),
      };

      const [people, total] = await Promise.all([
        prisma.person.findMany({
          where,
          select: PERSON_SELECT,
          orderBy: { name: "asc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.person.count({ where }),
      ]);

      return { people, total, pages: Math.ceil(total / limit) };
    });
  },
);

export const createPerson = withPermission(
  "create",
  "person",
  async (data: unknown): Promise<ActionResult<{ personId: string }>> => {
    return createResult(async () => {
      const parsed = createPersonSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const existing = await prisma.person.findFirst({
        where: { cpf: parsed.data.cpf, deletedAt: null },
      });
      if (existing)
        throw new Error("Já existe uma pessoa cadastrada com esse CPF");

      const { address, birthDate, ...rest } = parsed.data;

      const person = await prisma.person.create({
        data: {
          ...rest,
          birthDate: new Date(birthDate),
          address: {
            create: {
              ...address,
            },
          },
        },
      });

      return { personId: person.id };
    });
  },
);

export const updatePerson = withAllPermissions(
  ["read"],
  "person",
  async (id: string, data: unknown): Promise<ActionResult<void>> => {
    return createResult(async () => {
      const parsed = updatePersonSchema.safeParse(data);
      if (!parsed.success) {
        throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
      }

      const person = await prisma.person.findUnique({
        where: { id },
        select: { addressId: true },
      });
      if (!person) throw new Error("Pessoa não encontrada");

      const { address, birthDate, ...rest } = parsed.data;

      await prisma.person.update({
        where: { id },
        data: {
          ...rest,
          birthDate: new Date(birthDate),
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

export const deactivatePerson = withAllPermissions(
  ["read"],
  "person",
  async (id: string): Promise<ActionResult<void>> => {
    return createResult(async () => {
      await prisma.person.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
    });
  },
);

export const reactivatePerson = withAllPermissions(
  ["read"],
  "person",
  async (id: string): Promise<ActionResult<void>> => {
    return createResult(async () => {
      await prisma.person.update({
        where: { id },
        data: { deletedAt: null },
      });
    });
  },
);
