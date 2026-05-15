'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { LogoutButton } from './LogoutButton';
import { Suspense } from 'react';
import {
  Users,
  Settings,
  LayoutDashboard,
  Star,
  BarChart3,
  MessageSquare,
  Wrench
} from 'lucide-react';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const city = searchParams.get('city');
  const isLoginPage = pathname === '/admin/login';

  // Build city-aware links
  const getHref = (path: string) => {
    return city ? `${path}?city=${city}` : path;
  };

  const navItems = [
    { label: 'Dashboard', href: getHref('/admin/dashboard'), icon: LayoutDashboard },
    { label: 'Providers', href: getHref('/admin/providers'), icon: Users },
    { label: 'Reviews', href: getHref('/admin/reviews'), icon: Star },
    { label: 'Analytics', href: getHref('/admin/analytics'), icon: BarChart3 },
    { label: 'WhatsApp Bot', href: getHref('/admin/bot'), icon: MessageSquare },
    { label: 'Settings', href: getHref('/admin/settings'), icon: Settings },
  ];

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
        pathname === href.split('?')[0] && 'bg-muted text-primary font-bold shadow-sm'
      )}
    >
      {children}
    </Link>
  );

  if (isLoginPage) {
    return <>{children}</>; 
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40 font-body">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex shadow-sm">
        <div className="flex flex-col gap-2 p-4 h-full">
          <div className="flex h-16 items-center px-4 mb-4 gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            <span className="font-headline font-bold text-xl tracking-tight uppercase">
                {city ? `FixAm ${city}` : 'Admin Panel'}
            </span>
          </div>
          <nav className="flex-1 flex flex-col gap-1 px-2">
            {navItems.map(item => (
              <NavLink href={item.href} key={item.label}>
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto px-2 pb-4">
             <LogoutButton />
          </div>
        </div>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-64">
        <AdminHeader navItems={navItems} />
        <main className="flex-1 p-4 sm:px-6 sm:py-0">
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={null}>
            <AdminLayoutContent>{children}</AdminLayoutContent>
        </Suspense>
    );
}
