import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Function to create Prisma client based on environment
function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/database.db';
  
  // Check if we're using Turso (LibSQL)
  if (databaseUrl.startsWith('libsql://')) {
    // Production: Use Turso with LibSQL adapter
    const client = createClient({
      url: databaseUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    
    const adapter = new PrismaLibSQL(client);
    return new PrismaClient({ adapter });
  } else {
    // Development: Use regular SQLite
    return new PrismaClient({
      datasourceUrl: databaseUrl
    });
  }
}

// Create or reuse Prisma client
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

// Cache the client in development
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
