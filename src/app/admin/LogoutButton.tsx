'use client';

import { LogOut } from 'lucide-react';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { logoutAction } from './actions';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

export function LogoutButton() {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // 1. Sign out from Firebase Client SDK
      await auth.signOut();
      
      // 2. Clear server session via action
      // Note: logoutAction() will handle the redirect by throwing a redirect error
      await logoutAction();
      
    } catch (error: any) {
      // If the error is a Next.js redirect, let it bubble up
      if (error.message?.includes('NEXT_REDIRECT')) {
          throw error;
      }
      
      // Fallback redirect if something else fails
      toast({ title: 'Signing out...', description: 'Redirecting to login.' });
      window.location.href = '/admin/login';
    }
  };

  return (
    <SidebarMenuButton 
        onClick={handleLogout}
        tooltip="Log Out" 
        className="w-full h-12 rounded-xl text-destructive hover:bg-destructive/5 hover:text-destructive font-bold"
    >
        <LogOut className="mr-3 h-5 w-5" />
        <span>Log Out</span>
    </SidebarMenuButton>
  );
}
