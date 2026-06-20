"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { changePasswordSchema } from "@/lib/schemas/auth";
import { createResult, ActionResult } from "@/lib/action-result";
import bcrypt from "bcrypt";
import { authOptions } from "@/lib/auth/auth";

export async function changePasswordAction(
  data: unknown,
): Promise<ActionResult<void>> {
  return createResult(async () => {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) throw new Error("Não autenticado");

    const parsed = changePasswordSchema.safeParse(data);
    if (!parsed.success) {
      throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
    }

    const hash = await bcrypt.hash(parsed.data.password, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        hashPassword: hash,
        firstLogin: false,
        passwordResetRequired: false,
        lastPasswordChangedAt: new Date(),
      },
    });
  });
}
