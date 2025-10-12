import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client - handle build time gracefully
function createPrismaClient() {
  // During build, use a dummy database URL to prevent errors
  const databaseUrl = process.env.DATABASE_URL || 
    (process.env.NODE_ENV === 'production' ? 
      'file:./dummy.db' : 
      'file:./prisma/database.db');
  
  return new PrismaClient({
    datasourceUrl: databaseUrl,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache the client in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
