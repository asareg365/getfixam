'use client';

import { LogOut } from 'lucide-react';
import { logoutAction } from './actions';
import { auth } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface LogoutButtonProps {
    className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // 1. Sign out from Firebase Client SDK
      await auth.signOut();
      
      // 2. Clear server session via action
      await logoutAction();
      
    } catch (error: any) {
      if (error.message?.includes('NEXT_REDIRECT')) {
          throw error;
      }
      
      toast({ title: 'Signing out...', description: 'Redirecting to login.' });
      window.location.href = '/admin/login';
    }
  };

  return (
    <button 
        onClick={handleLogout}
        className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-destructive hover:bg-destructive/5 font-medium w-full",
            className
        )}
    >
        <LogOut className="h-4 w-4" />
        <span>Log Out</span>
    </button>
  );
}
