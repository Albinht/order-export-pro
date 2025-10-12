import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';

export default async function HomePage() {
  // Check if we have Shopify credentials in environment
  const hasShopifyConfig = process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ACCESS_TOKEN;
  
  // During build, skip database checks
  if (process.env.NODE_ENV !== 'production' && !hasShopifyConfig) {
    // Only check database in development
    try {
      const { prisma } = await import('@/lib/prisma');
      const storeCount = await prisma.store.count();
      if (storeCount === 0) {
        redirect('/setup');
        return;
      }
    } catch (error) {
      // Database issue, go to setup
      redirect('/setup');
      return;
    }
  }
  
  // In production without config, go to setup
  if (!hasShopifyConfig) {
    redirect('/setup');
    return;
  }
  
  const isAuthenticated = await verifyAuth();
  
  if (isAuthenticated) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
