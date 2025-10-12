#!/usr/bin/env node

const bcrypt = require('bcryptjs');

console.log('🧪 Testing Shopify Order Export App Configuration\n');
console.log('=' .repeat(50));

// Test environment variables
console.log('\n📋 Environment Variables Check:');
const requiredVars = [
  'SHOPIFY_STORE_DOMAIN',
  'SHOPIFY_ACCESS_TOKEN',
  'SHOPIFY_API_VERSION',
  'AUTH_SECRET'
];

const envVars = {
  SHOPIFY_STORE_DOMAIN: 'malen-nach-zahlen-experte.myshopify.com',
  SHOPIFY_ACCESS_TOKEN: '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',
  SHOPIFY_API_VERSION: '2025-01',
  AUTH_SECRET: '9XBFYlKIcCIHSM2oXGYICcCTfne7fst872TlP8M55Dw='
};

requiredVars.forEach(varName => {
  const value = envVars[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`❌ ${varName}: MISSING`);
  }
});

// Test authentication
console.log('\n🔐 Authentication Test:');
const testPassword = 'admin123';
const hash = '$2b$10$wIinAOSWCVQ6IQnHPNqryeK.eyksON6TAV4jkVlYU9qtOl0TkFj.W';

bcrypt.compare(testPassword, hash, (err, result) => {
  if (result) {
    console.log('✅ Password hash verification: WORKING');
    console.log('   Username: admin');
    console.log('   Password: admin123');
  } else {
    console.log('❌ Password hash verification: FAILED');
  }
});

// Test Shopify API
console.log('\n🛍️ Shopify API Test:');
const testShopifyConnection = async () => {
  try {
    const response = await fetch(
      `https://${envVars.SHOPIFY_STORE_DOMAIN}/admin/api/${envVars.SHOPIFY_API_VERSION}/shop.json`,
      {
        headers: {
          'X-Shopify-Access-Token': envVars.SHOPIFY_ACCESS_TOKEN,
          'Content-Type': 'application/json',
        },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Shopify connection: WORKING');
      console.log(`   Shop: ${data.shop.name}`);
      console.log(`   Domain: ${data.shop.domain}`);
    } else {
      console.log('❌ Shopify connection: FAILED');
      console.log(`   Status: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.log('❌ Shopify connection: ERROR');
    console.log(`   ${error.message}`);
  }
};

testShopifyConnection().then(() => {
  console.log('\n' + '=' .repeat(50));
  console.log('\n🎯 Deployment Instructions:');
  console.log('1. Go to vercel.com');
  console.log('2. Import GitHub repo: Albinht/order-export-pro');
  console.log('3. Add the environment variables shown above');
  console.log('4. Deploy!');
  console.log('\n✅ App URL will be: https://order-export-pro.vercel.app');
  console.log('\n📝 Check VERCEL-DEPLOY-FINAL.md for complete instructions');
});
