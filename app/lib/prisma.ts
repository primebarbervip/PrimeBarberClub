import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

// Force refresh: Prisma Client actualizado tras generación manual
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;