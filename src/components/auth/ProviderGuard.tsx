'use client';

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';


function FullPageLoader() {
    return (
        <div className="flex flex-col min-h-screen">
             <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center">
                    <Skeleton className="h-6 w-32" />
                    <div className="ml-auto">
                         <Skeleton className="h-6 w-20" />
                    </div>
                </div>
            </header>
             <main className="container mx-auto px-4 md:px-6 py-12">
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-10 w-1/3" />
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </div>
                    <Skeleton className="h-64 w-full" />
                </div>
            </main>
        </div>
    )
}


export default function ProviderGuard({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (!user) {
        // if not logged in, redirect to login page
        router.replace(`/provider/login?redirect=${pathname}`);
      } else {
        // if logged in, stop loading and show the page
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router, pathname]);

  if (loading) return <FullPageLoader />;

  return <>{children}</>;
}

    