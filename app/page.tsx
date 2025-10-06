import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';

export default async function HomePage() {
  const isAuthenticated = await verifyAuth();
  
  if (isAuthenticated) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
