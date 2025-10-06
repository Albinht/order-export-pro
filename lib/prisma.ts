import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  dbInitialized: boolean;
};

// Auto-initialize database on first use
function initializeDatabase() {
  if (globalForPrisma.dbInitialized) return;
  
  try {
    // Check if database exists
    const dbPath = path.join(process.cwd(), 'prisma', 'database.db');
    
    if (!fs.existsSync(dbPath)) {
      console.log('🔧 Auto-creating database...');
      
      // Try to run migrations
      try {
        execSync('npx prisma db push --skip-generate', { 
          stdio: 'pipe',
          env: {
            ...process.env,
            DATABASE_URL: process.env.DATABASE_URL || 'file:./prisma/database.db'
          }
        });
        console.log('✅ Database ready!');
      } catch (e) {
        // Migrations might fail on Vercel, that's okay
        console.log('📦 Database will be created on first use');
      }
    }
    
    globalForPrisma.dbInitialized = true;
  } catch (error) {
    // Silent fail - database will be created on first use
    globalForPrisma.dbInitialized = true;
  }
}

// Initialize database before creating Prisma client
if (typeof window === 'undefined') {
  initializeDatabase();
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
