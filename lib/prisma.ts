import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client - handle build time gracefully
function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
  const databaseAuthToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

  if (databaseUrl && databaseUrl.startsWith('libsql://')) {
    const client = createClient({
      url: databaseUrl,
      authToken: databaseAuthToken,
    });
    const adapter = new PrismaLibSQL(client as any);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  const fallbackUrl = databaseUrl ||
    (process.env.NODE_ENV === 'production'
      ? 'file:./dummy.db'
      : 'file:./prisma/dev.db');

  return new PrismaClient({
    datasourceUrl: fallbackUrl,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache the client in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
