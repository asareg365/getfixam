'use client';

import Link from 'next/link';
import { LayoutDashboard, Users, BarChart3, MessageSquare, Settings, LogOut, Wrench } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Artisans', href: '/admin/artisans', icon: Users },
    { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
    { label: 'WhatsApp Bot', href: '/admin/bot', icon: MessageSquare },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white border-r flex flex-col h-auto md:h-screen sticky top-0">
        <div className="h-16 flex items-center px-6 border-b">
          <Wrench className="h-6 w-6 text-primary" />
          <span className="ml-2 font-bold text-lg text-primary">FixAm Admin</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all",
                pathname === item.href 
                  ? "bg-primary text-white" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/5 rounded-xl transition-all">
            <LogOut className="mr-3 h-5 w-5" />
            Log Out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
