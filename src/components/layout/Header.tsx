'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Wrench, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UserNav from './UserNav';

export default function Header() {
  const params = useParams();
  const city = (params.city as string) || 'berekum';
  const cityPath = `/${city}`;

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <Link className="flex items-center justify-center" href={cityPath}>
        <Wrench className="h-6 w-6 text-primary" />
        <span className="ml-2 font-bold text-xl tracking-tight text-primary font-headline uppercase">{city === 'berekum' ? 'GetFixam' : `Fixam ${city}`}</span>
      </Link>
      <nav className="ml-auto flex gap-4 items-center">
        <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:inline-block" href={`${cityPath}/category/all`}>
          Browse Categories
        </Link>
        <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:inline-block" href={`${cityPath}/contact`}>
          Contact Us
        </Link>
        <Button asChild className="rounded-full font-bold">
          <Link href={`${cityPath}/add-provider`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            List Business
          </Link>
        </Button>
        <UserNav />
      </nav>
    </header>
  );
}
