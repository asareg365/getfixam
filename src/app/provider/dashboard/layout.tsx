'use client';

import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function LogoutButton() {
    const router = useRouter();
    const { toast } = useToast();

    const handleLogout = async () => {
        await auth.signOut();
        toast({ title: 'Logged out successfully.' });
        router.push('/');
    }

    return (
        <Button variant="ghost" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
        </Button>
    )
}

export default function ProviderDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
                <Link href="/browse" className="mr-6 flex items-center space-x-2">
                    <Wrench className="h-6 w-6 text-primary" />
                    <span className="font-bold font-headline">FixAm Provider</span>
                </Link>
                <div className="ml-auto">
                    <LogoutButton />
                </div>
            </div>
        </header>
        <main className="container mx-auto px-4 md:px-6 py-12">
            {children}
        </main>
    </div>
  );
}
