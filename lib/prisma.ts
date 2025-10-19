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

  // Log database configuration in development
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Prisma Configuration:');
    console.log('   DATABASE_URL:', databaseUrl ? `${databaseUrl.substring(0, 30)}...` : 'NOT SET');
    console.log('   AUTH_TOKEN:', databaseAuthToken ? 'SET' : 'NOT SET');
  }

  // Build time: use dummy database to prevent errors
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('🔨 Build time - using dummy database');
    return new PrismaClient({
      datasourceUrl: 'file:./dummy.db',
    });
  }

  // Runtime validation - CRITICAL
  if (!databaseUrl) {
    const errorMsg = '❌ RUNTIME ERROR: DATABASE_URL is not set!\n\n' +
      'Please add DATABASE_URL to your Vercel environment variables:\n' +
      '1. Go to your Vercel project → Settings → Environment Variables\n' +
      '2. Add: DATABASE_URL = libsql://order-export-db-albinht.aws-ap-northeast-1.turso.io\n' +
      '3. Add: DATABASE_AUTH_TOKEN = [your token]\n' +
      '4. Redeploy your application\n\n' +
      'See VERCEL-SETUP.md for detailed instructions.';
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  // Handle Turso/LibSQL connection
  if (databaseUrl.startsWith('libsql://')) {
    if (!databaseAuthToken) {
      const errorMsg = '❌ RUNTIME ERROR: DATABASE_AUTH_TOKEN is required for Turso!\n\n' +
        'Please add DATABASE_AUTH_TOKEN to your Vercel environment variables.\n' +
        'See CREDENTIALS.local.md for the token value.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    console.log('✅ Connecting to Turso database...');
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
  if (databaseUrl.startsWith('file:')) {
    console.log('💾 Using local SQLite database');
    return new PrismaClient({
      datasourceUrl: databaseUrl,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  // Invalid database URL
  throw new Error(`❌ Invalid DATABASE_URL format: ${databaseUrl}\nExpected: libsql:// or file:`);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache the client in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
