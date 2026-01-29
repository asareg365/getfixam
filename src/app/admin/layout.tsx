'use client';

import { usePathname } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Home, List, Settings, LogOut, Wrench, Workflow } from 'lucide-react';
import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If on login page, render children directly without the layout.
  // This ensures the login screen is a standalone page.
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }
  
  // Session check is now handled by middleware.
  
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <Link href="/admin/dashboard" className="flex items-center gap-2 p-2">
            <Wrench className="h-6 h-6 text-primary" />
            <h1 className="font-bold font-headline text-lg">FixAm Admin</h1>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <Link href="/admin/dashboard">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Providers">
                <Link href="/admin/providers">
                  <List />
                  <span>Providers</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Jobs">
                <Link href="/admin/jobs">
                  <Workflow />
                  <span>Jobs</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Services">
                <Link href="/admin/services">
                  <Settings />
                  <span>Services</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
              <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Log Out">
                      <Link href="/admin/logout">
                          <LogOut />
                          <span>Log Out</span>
                      </Link>
                  </SidebarMenuButton>
              </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6">
            <SidebarTrigger className="md:hidden"/>
            <div className="flex-1">
                {/* Header content can go here */}
            </div>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
