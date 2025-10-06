import { redirect } from 'next/navigation';
import { verifyAuth } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = await verifyAuth();
  
  if (!isAuthenticated) {
    redirect('/login');
  }

  return <>{children}</>;
}
