'use client';

import { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, BarChart3, MessageSquare, Settings, LogOut, Menu, X, Wrench } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser && pathname !== '/admin/login') {
        router.push('/admin/login');
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  if (!user && pathname !== '/admin/login') return null;
  if (pathname === '/admin/login') return <>{children}</>;

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Artisans', href: '/admin/artisans', icon: Users },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'WhatsApp Bot', href: '/admin/bot', icon: MessageSquare },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Mobile Header */}
      <header className="md:hidden h-16 bg-white border-b flex items-center px-4 justify-between sticky top-0 z-40">
        <div className="flex items-center">
          <Wrench className="h-6 w-6 text-primary" />
          <span className="ml-2 font-bold">FixAm Admin</span>
        </div>
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-white border-r transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            <div className="h-16 flex items-center px-6 justify-between md:justify-start">
              <div className="flex items-center">
                <Wrench className="h-6 w-6 text-primary" />
                <span className="ml-2 font-bold text-lg">FixAm Panel</span>
              </div>
              <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${pathname === item.href ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
                  `}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="p-4 border-t">
              <button
                onClick={() => signOut(auth)}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-destructive rounded-lg hover:bg-destructive/5 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Log Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function Loader({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
  );
}