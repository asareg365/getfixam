'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { LayoutDashboard, User, Wrench, Calendar, Star, Settings } from 'lucide-react';

const navLinks = [
  { href: '/provider/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/provider/profile', label: 'Profile', icon: User },
  { href: '/provider/services', label: 'My Services', icon: Wrench },
  { href: '/provider/availability', label: 'Availability', icon: Calendar },
  { href: '/provider/reviews', label: 'My Reviews', icon: Star },
  { href: '/provider/settings', label: 'Settings', icon: Settings },
];

export function ProviderNav() {
  const pathname = usePathname();

  return (
    <div className="border-b">
      <div className="container mx-auto px-4 md:px-6">
        <nav className="flex items-center space-x-1 -mb-px overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-3 border-b-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
