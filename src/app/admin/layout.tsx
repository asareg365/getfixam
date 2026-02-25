"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import {
  Bell,
  Home,
  Users,
  Settings,
  PanelLeft,
  LayoutDashboard,
  Star,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { AdminHeader } from '@/components/admin/AdminHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const navItems = [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Providers', href: '/admin/providers', icon: Users },
        { label: 'Engagements', href: '/admin/provider/engagements', icon: Users },
        { label: 'Reviews', href: '/admin/reviews', icon: Star },
        { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
        { label: 'WhatsApp Bot', href: '/admin/bot', icon: MessageSquare },
        { label: 'Settings', href: '/admin/settings', icon: Settings },
      ];

  const pathname = usePathname();

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
        pathname === href && "bg-muted text-primary"
      )}
    >
      {children}
    </Link>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-60 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col gap-2 p-4">
          <div className="flex h-16 items-center font-bold text-lg">
           Admin Panel
          </div>
          {navItems.map(item => (
             <NavLink href={item.href} key={item.label}>
                <item.icon className="h-4 w-4" />
                {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-60">
        <AdminHeader navItems={navItems} />
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
            {children}
        </main>
      </div>
    </div>
  );
}
