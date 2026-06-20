import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcrypt";

const ADMIN_USERNAME = process.env.ADMIN_USERNAME!;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD!;

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.user.findUnique({
    where: { username: ADMIN_USERNAME },
  });

  if (existing) {
    console.log("User admin already exists, skipping creation");
    return;
  }

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await prisma.user.create({
    data: {
      name: "Administrador",
      username: ADMIN_USERNAME,
      hashPassword: hash,
      isAdmin: true,
    },
  });

  console.log("User admin created successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
