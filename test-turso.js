// Quick test script to verify Turso connection
const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.production.local' });

async function testTurso() {
  console.log('🧪 Testing Turso connection...\n');
  
  try {
    const client = createClient({
      url: process.env.DATABASE_URL,
      authToken: process.env.DATABASE_AUTH_TOKEN,
    });
    
    // Test query
    const result = await client.execute("SELECT COUNT(*) as count FROM Store");
    console.log(`✅ Connection successful!`);
    console.log(`📊 Stores in database: ${result.rows[0].count}`);
    
    // Get store details
    const stores = await client.execute("SELECT name, domain FROM Store");
    if (stores.rows.length > 0) {
      console.log('\n📦 Stores:');
      stores.rows.forEach(store => {
        console.log(`   - ${store.name} (${store.domain})`);
      });
    }
    
    // Check all tables
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('\n📋 Available tables:');
    tables.rows.forEach(table => {
      console.log(`   - ${table.name}`);
    });
    
    console.log('\n🎉 Turso database is ready for production!');
    client.close();
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('\n🔍 Check:');
    console.error('   1. Is your DATABASE_URL correct?');
    console.error('   2. Is your DATABASE_AUTH_TOKEN valid?');
    console.error('   3. Is your internet connection working?');
    process.exit(1);
  }
}

testTurso();
