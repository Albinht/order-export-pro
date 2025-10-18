import { PrismaClient } from '@prisma/client';
import { createClient } from '@libsql/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client - handle build time gracefully
function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL || '';
  const databaseAuthToken = process.env.DATABASE_AUTH_TOKEN || process.env.TURSO_AUTH_TOKEN;

  // Log database configuration in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Prisma Configuration:');
    console.log('   DATABASE_URL:', databaseUrl ? `${databaseUrl.substring(0, 30)}...` : 'NOT SET');
    console.log('   AUTH_TOKEN:', databaseAuthToken ? 'SET' : 'NOT SET');
  }

  // Validate database URL
  if (!databaseUrl) {
    const errorMsg = 'DATABASE_URL is not set. Please configure DATABASE_URL in your environment variables.';
    console.error('❌', errorMsg);
    throw new Error(errorMsg);
  }

  // Handle Turso/LibSQL connection
  if (databaseUrl.startsWith('libsql://')) {
    if (!databaseAuthToken) {
      const errorMsg = 'DATABASE_AUTH_TOKEN is required for LibSQL/Turso connections';
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    console.log('📡 Connecting to Turso database...');
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

  // Handle local SQLite
  console.log('💾 Using local SQLite database');
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
