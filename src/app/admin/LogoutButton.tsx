'use client';

import { LogOut } from 'lucide-react';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import { logoutAction } from './actions';

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <SidebarMenuButton type="submit" tooltip="Log Out" className="w-full">
        <LogOut />
        <span>Log Out</span>
      </SidebarMenuButton>
    </form>
  );
}
