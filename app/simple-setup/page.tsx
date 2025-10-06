'use client';

import { useState } from 'react';

export default function SimpleSetupPage() {
  const [config, setConfig] = useState({
    platform: 'shopify',
    domain: '',
    accessToken: '',
    consumerKey: '',
    consumerSecret: ''
  });
  const [showInstructions, setShowInstructions] = useState(false);
  const [envVars, setEnvVars] = useState<string[]>([]);

  const generateConfig = () => {
    const vars = [];
    
    if (config.platform === 'shopify') {
      vars.push(`DATABASE_URL=file:./prisma/database.db`);
      vars.push(`SHOPIFY_STORE_DOMAIN=${config.domain}`);
      vars.push(`SHOPIFY_ACCESS_TOKEN=${config.accessToken}`);
      vars.push(`SHOPIFY_API_VERSION=2025-01`);
      vars.push(`AUTH_SECRET=xK9mN3pQ7vB2wF5zL8hG4jR6tY1sD0aE`);
    } else {
      vars.push(`DATABASE_URL=file:./prisma/database.db`);
      vars.push(`WOOCOMMERCE_DOMAIN=${config.domain}`);
      vars.push(`WOOCOMMERCE_KEY=${config.consumerKey}`);
      vars.push(`WOOCOMMERCE_SECRET=${config.consumerSecret}`);
      vars.push(`AUTH_SECRET=xK9mN3pQ7vB2wF5zL8hG4jR6tY1sD0aE`);
    }
    
    setEnvVars(vars);
    setShowInstructions(true);
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow p-8">
            <h1 className="text-2xl font-bold mb-6">✅ Configuration Ready!</h1>
            
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Add these to Vercel Environment Variables:</h2>
              <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                {envVars.map((v, i) => (
                  <div key={i} className="mb-1">{v}</div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Next Steps:</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Copy the environment variables above</li>
                <li>Go to your Vercel Dashboard</li>
                <li>Navigate to Settings → Environment Variables</li>
                <li>Add each variable (name and value)</li>
                <li>Redeploy your application</li>
                <li>Login with username: <code className="bg-gray-100 px-1">admin</code> password: <code className="bg-gray-100 px-1">1n$$2O%n2$f2</code></li>
              </ol>
            </div>

            <button
              onClick={() => {
                setShowInstructions(false);
                setConfig({
                  platform: 'shopify',
                  domain: '',
                  accessToken: '',
                  consumerKey: '',
                  consumerSecret: ''
                });
              }}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Configure Another Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-8">
          <h1 className="text-2xl font-bold mb-6">🚀 Simple Setup</h1>
          <p className="text-gray-600 mb-6">Generate environment variables for your Vercel deployment</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Platform</label>
              <select
                value={config.platform}
                onChange={(e) => setConfig({...config, platform: e.target.value})}
                className="w-full p-2 border rounded"
              >
                <option value="shopify">Shopify</option>
                <option value="woocommerce">WooCommerce</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Store Domain</label>
              <input
                type="text"
                value={config.domain}
                onChange={(e) => setConfig({...config, domain: e.target.value})}
                placeholder={config.platform === 'shopify' ? 'store.myshopify.com' : 'store.com'}
                className="w-full p-2 border rounded"
              />
            </div>

            {config.platform === 'shopify' ? (
              <div>
                <label className="block text-sm font-medium mb-2">Access Token</label>
                <input
                  type="password"
                  value={config.accessToken}
                  onChange={(e) => setConfig({...config, accessToken: e.target.value})}
                  placeholder="shpat_xxxxx"
                  className="w-full p-2 border rounded"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-2">Consumer Key</label>
                  <input
                    type="text"
                    value={config.consumerKey}
                    onChange={(e) => setConfig({...config, consumerKey: e.target.value})}
                    placeholder="ck_xxxxx"
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Consumer Secret</label>
                  <input
                    type="password"
                    value={config.consumerSecret}
                    onChange={(e) => setConfig({...config, consumerSecret: e.target.value})}
                    placeholder="cs_xxxxx"
                    className="w-full p-2 border rounded"
                  />
                </div>
              </>
            )}

            <button
              onClick={generateConfig}
              disabled={!config.domain || (config.platform === 'shopify' ? !config.accessToken : !config.consumerKey || !config.consumerSecret)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generate Configuration
            </button>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> This page helps you generate the environment variables needed for Vercel. 
              After adding them to Vercel, redeploy your app.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
