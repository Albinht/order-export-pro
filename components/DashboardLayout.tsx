'use client';

import { ReactNode } from 'react';
import { 
  Package, 
  Download, 
  Store, 
  Clock, 
  Settings, 
  BarChart3,
  ShoppingBag,
  RefreshCw,
  FileSpreadsheet,
  Globe,
  LogOut,
  User,
  Shield
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
  storeName?: string;
  storeType?: 'shopify' | 'woocommerce';
}

export default function DashboardLayout({ children, storeName, storeType }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const navigation = [
    { name: 'Orders', href: '/dashboard', icon: ShoppingBag },
    { name: 'Export History', href: '/export-history', icon: FileSpreadsheet },
    { name: 'Stores', href: '/stores', icon: Store },
    { name: 'Admin', href: '/admin', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      {/* Top Navigation Bar - Ahrefs style */}
      <header className="bg-[rgb(var(--color-primary))] text-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Package className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold">OrderExport</span>
              </div>
              
              {/* Main Nav */}
              <nav className="flex items-center gap-1">
                {navigation.slice(0, 3).map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                      ${pathname === item.href 
                        ? 'bg-white/20 text-white' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Store indicator */}
              {storeName && (
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                  <Globe className="w-4 h-4" />
                  <span className="font-medium">{storeName}</span>
                  {storeType && (
                    <span className={`
                      px-2 py-0.5 rounded text-xs font-bold uppercase
                      ${storeType === 'shopify' ? 'bg-green-400 text-green-900' : 'bg-purple-400 text-purple-900'}
                    `}>
                      {storeType === 'shopify' ? 'SH' : 'WC'}
                    </span>
                  )}
                </div>
              )}
              
              {/* User menu */}
              <div className="flex items-center gap-2">
                <button className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all flex items-center gap-2 px-3">
                  <User className="w-4 h-4" />
                  <span className="text-sm">Admin</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-all flex items-center gap-2 px-3"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  );
}
