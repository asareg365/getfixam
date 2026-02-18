'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BarChart3, MessageSquare, Settings, LogOut, Wrench, Menu, X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { logoutAction } from './actions';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  if (pathname === '/admin/login') return <>{children}</>;

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Artisans', href: '/admin/providers', icon: Users },
    { label: 'Reviews', href: '/admin/reviews', icon: Star },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'WhatsApp Bot', href: '/admin/bot', icon: MessageSquare },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col md:flex-row font-body">
      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 h-16 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-primary font-headline">FixAm Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Sidebar Navigation */}
      <aside className={cn(
        "fixed inset-0 z-40 bg-black/50 md:relative md:bg-transparent transition-opacity duration-300 md:opacity-100",
        isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none md:pointer-events-auto"
      )}>
        <nav className={cn(
          "w-72 bg-white border-r flex flex-col h-full transform transition-transform duration-300 md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="hidden md:flex h-20 items-center px-8 border-b">
            <div className="bg-primary/10 p-2 rounded-lg mr-3">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <span className="font-bold text-xl text-primary font-headline">FixAm Admin</span>
          </div>
          
          <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-4">Navigation</p>
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center px-4 py-3.5 text-sm font-semibold rounded-2xl transition-all duration-200",
                  pathname === item.href 
                    ? "bg-primary text-white shadow-xl shadow-primary/20" 
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn("mr-3 h-5 w-5", pathname === item.href ? "text-white" : "text-primary/60")} />
                {item.label}
              </Link>
            ))}
          </div>

          <div className="p-6 border-t mt-auto">
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/5 hover:text-destructive rounded-2xl px-4 py-6 font-bold">
                <LogOut className="mr-3 h-5 w-5" />
                Sign Out
              </Button>
            </form>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-16 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
