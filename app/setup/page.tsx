'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [formData, setFormData] = useState({
    storeName: 'My Store',
    storeDomain: '',
    accessToken: '',
    platform: 'shopify' as 'shopify' | 'woocommerce',
    consumerKey: '',
    consumerSecret: ''
  });

  useEffect(() => {
    // Check if setup is already complete
    checkSetup();
  }, []);

  const checkSetup = async () => {
    try {
      const res = await fetch('/api/setup/check');
      const data = await res.json();
      if (data.setupComplete) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Setup check failed:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create initial store
      const storeRes = await fetch('/api/setup/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.storeName,
          domain: formData.storeDomain,
          platform: formData.platform,
          accessToken: formData.platform === 'shopify' ? formData.accessToken : undefined,
          consumerKey: formData.platform === 'woocommerce' ? formData.consumerKey : undefined,
          consumerSecret: formData.platform === 'woocommerce' ? formData.consumerSecret : undefined,
        })
      });

      if (storeRes.ok) {
        setSetupComplete(true);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        const error = await storeRes.json();
        console.error('Setup failed:', error);
        alert('Setup failed: ' + (error.error || error.details || error.message || 'Unknown error. Check console for details.'));
      }
    } catch (error) {
      alert('Setup error: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  if (setupComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="text-green-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Setup Complete!</h2>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🚀 Welcome to Order Export Pro
          </h1>
          <p className="text-gray-600">Let's set up your first store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, platform: 'shopify'})}
                className={`p-3 border-2 rounded-lg text-center transition-all ${
                  formData.platform === 'shopify' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">Shopify</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, platform: 'woocommerce'})}
                className={`p-3 border-2 rounded-lg text-center transition-all ${
                  formData.platform === 'woocommerce' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="font-semibold">WooCommerce</div>
              </button>
            </div>
          </div>

          {/* Store Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store Name
            </label>
            <input
              type="text"
              value={formData.storeName}
              onChange={(e) => setFormData({...formData, storeName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="My Awesome Store"
              required
            />
          </div>

          {/* Store Domain */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store Domain
            </label>
            <input
              type="text"
              value={formData.storeDomain}
              onChange={(e) => setFormData({...formData, storeDomain: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={formData.platform === 'shopify' ? 'mystore.myshopify.com' : 'mystore.com'}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.platform === 'shopify' 
                ? 'Your Shopify domain (e.g., store-name.myshopify.com)'
                : 'Your WooCommerce store URL (without https://)'}
            </p>
          </div>

          {/* Shopify Fields */}
          {formData.platform === 'shopify' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Admin API Access Token
              </label>
              <input
                type="password"
                value={formData.accessToken}
                onChange={(e) => setFormData({...formData, accessToken: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="shpat_xxxxxxxxxxxx"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Get this from Shopify Admin → Apps → Private apps
              </p>
            </div>
          )}

          {/* WooCommerce Fields */}
          {formData.platform === 'woocommerce' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consumer Key
                </label>
                <input
                  type="text"
                  value={formData.consumerKey}
                  onChange={(e) => setFormData({...formData, consumerKey: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ck_xxxxxxxxxx"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Consumer Secret
                </label>
                <input
                  type="password"
                  value={formData.consumerSecret}
                  onChange={(e) => setFormData({...formData, consumerSecret: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="cs_xxxxxxxxxx"
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Get these from WooCommerce → Settings → Advanced → REST API
              </p>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-sm text-blue-900 mb-1">Login Credentials</h3>
          <p className="text-xs text-blue-700">
            After setup, use these to login:<br/>
            Username: <code className="bg-white px-1 rounded">admin</code><br/>
            Password: <code className="bg-white px-1 rounded">1n$$2O%n2$f2</code>
          </p>
        </div>
      </div>
    </div>
  );
}
