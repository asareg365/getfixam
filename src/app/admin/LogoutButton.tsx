
'use client';

import { LogOut } from 'lucide-react';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { logoutAction } from './actions';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export function LogoutButton() {
  const { toast } = useToast();

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Sign out from Firebase Client SDK
      await auth.signOut();
      
      // 2. Clear server session via action
      await logoutAction();
      
      toast({ title: 'Signed out' });
    } catch (error) {
      // Fallback redirect if something fails
      window.location.href = '/admin/login';
    }
  };

  return (
    <form onSubmit={handleLogout}>
      <SidebarMenuButton type="submit" tooltip="Log Out" className="w-full h-12 rounded-xl text-destructive hover:bg-destructive/5 hover:text-destructive font-bold">
        <LogOut className="mr-3 h-5 w-5" />
        <span>Log Out</span>
      </SidebarMenuButton>
    </form>
  );
}
