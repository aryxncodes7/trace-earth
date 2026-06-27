import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in development hot-reloading
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// WARNING: The previous hardcoded database secret must be rotated immediately via the database provider dashboard and scrubbed from history.
const databaseUrl = process.env.DATABASE_URL as string;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

