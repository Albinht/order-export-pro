const { createClient } = require('@libsql/client');

// Load environment from .env.production.local
require('dotenv').config({ path: '.env.production.local' });

const DATABASE_URL = process.env.DATABASE_URL || 'libsql://order-export-db-albinht.aws-ap-northeast-1.turso.io';
const DATABASE_AUTH_TOKEN = process.env.DATABASE_AUTH_TOKEN;

if (!DATABASE_AUTH_TOKEN) {
  console.error('❌ DATABASE_AUTH_TOKEN is not set in .env.production.local');
  process.exit(1);
}

async function setupDatabase() {
  console.log('🚀 Setting up Turso database...');
  console.log(`📍 Database URL: ${DATABASE_URL}`);
  
  const client = createClient({
    url: DATABASE_URL,
    authToken: DATABASE_AUTH_TOKEN,
  });

  try {
    // Create tables
    const queries = [
      // Store table
      `CREATE TABLE IF NOT EXISTS Store (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        domain TEXT UNIQUE NOT NULL,
        platform TEXT DEFAULT 'shopify',
        accessToken TEXT,
        consumerKey TEXT,
        consumerSecret TEXT,
        isActive INTEGER DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // ExportHistory table
      `CREATE TABLE IF NOT EXISTS ExportHistory (
        id TEXT PRIMARY KEY,
        storeId TEXT NOT NULL,
        filename TEXT NOT NULL,
        orderCount INTEGER NOT NULL,
        orderIds TEXT NOT NULL,
        exportedBy TEXT DEFAULT 'user',
        exportedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT,
        FOREIGN KEY (storeId) REFERENCES Store(id)
      )`,
      
      // OrderStatus table
      `CREATE TABLE IF NOT EXISTS OrderStatus (
        id TEXT PRIMARY KEY,
        storeId TEXT NOT NULL,
        orderId TEXT NOT NULL,
        orderNumber TEXT NOT NULL,
        status TEXT NOT NULL,
        fulfillmentId TEXT,
        trackingNumber TEXT,
        trackingCompany TEXT,
        notes TEXT,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (storeId) REFERENCES Store(id),
        UNIQUE(storeId, orderId)
      )`,
      
      // User table
      `CREATE TABLE IF NOT EXISTS User (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const query of queries) {
      console.log(`📝 Creating table...`);
      await client.execute(query);
    }
    
    // Check if tables were created
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('\n✅ Database tables created:');
    tables.rows.forEach(row => {
      console.log(`   - ${row.name}`);
    });
    
    // Insert default store if not exists
    const storeCheck = await client.execute("SELECT COUNT(*) as count FROM Store");
    if (storeCheck.rows[0].count === 0) {
      console.log('\n📦 Creating default store...');
      await client.execute({
        sql: `INSERT INTO Store (id, name, domain, platform, accessToken, isActive) 
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          'default-store-1',
          'Malen Nach Zahlen Experte',
          'malen-nach-zahlen-experte.myshopify.com',
          'shopify',
          process.env.SHOPIFY_ACCESS_TOKEN || '',
          1
        ]
      });
      console.log('✅ Default store created');
    }
    
    console.log('\n🎉 Turso database setup complete!');
    console.log('📋 Next steps:');
    console.log('   1. Deploy to Cloudflare: ./deploy-cloudflare.sh');
    console.log('   2. Or test locally: npm run dev');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    client.close();
  }
}

setupDatabase();
