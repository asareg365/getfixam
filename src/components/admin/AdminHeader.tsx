'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { PanelLeft, Wrench } from 'lucide-react';
import React from 'react';
import { LogoutButton } from '@/app/admin/LogoutButton';

export function AdminHeader({ navItems }: { navItems: { label: string; href: string; icon: React.ElementType }[] }) {
  const pathname = usePathname();

  const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
        pathname === href && 'bg-muted text-primary'
      )}
    >
      {children}
    </Link>
  );

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden rounded-xl">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs flex flex-col">
          <SheetTitle className="sr-only">Admin Navigation</SheetTitle>
          <SheetDescription className="sr-only">Main menu for mobile devices</SheetDescription>
          <div className="flex h-16 items-center font-bold text-lg px-4 mb-4 gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            <span className="font-headline font-bold uppercase">FixAm Admin</span>
          </div>
          <nav className="grid gap-2 text-lg font-medium flex-1">
            {navItems.map(item => (
              <NavLink href={item.href} key={item.label}>
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto border-t pt-4 pb-8">
            <LogoutButton />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Mobile Breadcrumb or Current Page Indicator */}
      <div className="sm:hidden flex-1">
          <span className="font-headline font-bold text-sm uppercase tracking-wider text-muted-foreground/80">
              {navItems.find(n => n.href === pathname)?.label || 'Admin'}
          </span>
      </div>
    </header>
  );
}
