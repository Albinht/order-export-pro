import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  // Check if initial setup is needed
  try {
    const storeCount = await prisma.store.count();
    if (storeCount === 0) {
      redirect('/setup');
      return;
    }
  } catch (error) {
    // Database not initialized, go to setup
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
