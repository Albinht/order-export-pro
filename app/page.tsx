import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';

export default async function HomePage() {
  // Check if we have Shopify credentials in environment
  const hasShopifyConfig = process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ACCESS_TOKEN;
  
  // If no Shopify config, show error
  if (!hasShopifyConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Required</h1>
          <p className="text-gray-600">Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_ACCESS_TOKEN environment variables.</p>
        </div>
      </div>
    );
  }
  
  const isAuthenticated = await verifyAuth();
  
  if (isAuthenticated) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
