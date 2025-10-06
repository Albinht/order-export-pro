import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

let prisma: PrismaClient;

// Automatische database initialisatie
export async function initDatabase() {
  try {
    // Check of database bestaat
    const dbPath = path.join(process.cwd(), 'prisma', 'database.db');
    const dbExists = fs.existsSync(dbPath);
    
    if (!dbExists) {
      console.log('🔧 Creating database for first time...');
      
      // Run migrations automatisch
      try {
        execSync('npx prisma migrate deploy', { 
          stdio: 'pipe',
          env: {
            ...process.env,
            DATABASE_URL: process.env.DATABASE_URL || 'file:./prisma/database.db'
          }
        });
        console.log('✅ Database created successfully!');
      } catch (error) {
        console.log('📦 Using database schema push instead...');
        execSync('npx prisma db push', { 
          stdio: 'pipe',
          env: {
            ...process.env,
            DATABASE_URL: process.env.DATABASE_URL || 'file:./prisma/database.db'
          }
        });
      }
    }
    
    // Initialize Prisma client
    if (!prisma) {
      prisma = new PrismaClient();
    }
    
    // Check if we need to create default store
    const storeCount = await prisma.store.count();
    if (storeCount === 0 && process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ACCESS_TOKEN) {
      console.log('🏪 Creating default Shopify store...');
      await prisma.store.create({
        data: {
          name: 'Default Store',
          domain: process.env.SHOPIFY_STORE_DOMAIN,
          platform: 'shopify',
          accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
          isActive: true
        }
      });
      console.log('✅ Default store created!');
    }
    
    // Check if we need to create default user
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      console.log('👤 Creating default admin user...');
      await prisma.user.create({
        data: {
          username: 'admin',
          passwordHash: '$2a$10$K7L1OJ1/TFy8h5h4hM3PzuKPJK0J0J0J0J0J0J0J0J0J0J0J0J0J0' // 1n$$2O%n2$f2
        }
      });
      console.log('✅ Default admin user created!');
    }
    
    return prisma;
  } catch (error) {
    console.error('Database initialization error:', error);
    // Fallback naar in-memory database als alles faalt
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./prisma/database.db'
        }
      }
    });
    return prisma;
  }
}

// Export een functie om de Prisma client te krijgen
export async function getDb() {
  if (!prisma) {
    prisma = await initDatabase();
  }
  return prisma;
}
