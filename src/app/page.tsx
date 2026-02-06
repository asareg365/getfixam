'use client';

import Link from 'next/link';
import { Wrench, ArrowRight, ShieldCheck, Smartphone, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="/">
          <Wrench className="h-6 w-6 text-primary" />
          <span className="ml-2 font-bold text-xl font-headline">FixAm Ghana</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:block" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/admin/login">
            Admin
          </Link>
          <Button asChild size="sm">
            <Link href="/add-provider">List Business</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="space-y-4">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-primary font-headline">
                  Find Trusted Local Artisans <br className="hidden md:inline" /> in Berekum
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl lg:text-2xl">
                  Connect with verified plumbers, electricians, and mechanics in your neighborhood. Quick, reliable, and just a call away.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Button asChild size="lg" className="rounded-full px-8">
                  <Link href="/browse">
                    Browse All Artisans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center p-8 border rounded-3xl shadow-sm bg-background/50">
                <div className="p-3 bg-secondary/20 rounded-2xl">
                  <ShieldCheck className="h-10 w-10 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold font-headline">Verified Pros</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every artisan on FixAm is manually verified by our team to ensure quality and safety for your home.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-8 border rounded-3xl shadow-sm bg-background/50">
                <div className="p-3 bg-secondary/20 rounded-2xl">
                  <Smartphone className="h-10 w-10 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold font-headline">Instant Contact</h3>
                <p className="text-muted-foreground leading-relaxed">
                  No middleman. Call or WhatsApp your chosen professional directly with a single click.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center p-8 border rounded-3xl shadow-sm bg-background/50">
                <div className="p-3 bg-secondary/20 rounded-2xl">
                  <Wrench className="h-10 w-10 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold font-headline">Local Expertise</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Specifically built for Berekum. We know the neighborhoods and the best hands around.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 w-full shrink-0 border-t bg-white px-4 md:px-6 text-center">
        <p className="text-xs text-muted-foreground">
          © 2024 FixAm Ghana. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
