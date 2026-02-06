'use client';

import Link from 'next/link';
import { Wrench, ArrowRight, ShieldCheck, Smartphone, Search } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="/">
          <Wrench className="h-6 w-6 text-primary" />
          <span className="ml-2 font-bold text-xl tracking-tight">FixAm Ghana</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/admin/login">
            Admin
          </Link>
          <Link href="/add-provider" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            List Business
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-40 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="container px-4 md:px-6 mx-auto text-center space-y-8">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-primary">
              Find Trusted Local Artisans <br className="hidden md:inline" /> in Berekum
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl lg:text-2xl">
              Connect with verified plumbers, electricians, and mechanics in your neighborhood. Quick, reliable, and just a call away.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/browse" className="bg-primary text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-primary/30 hover:scale-105 transition-transform flex items-center">
                Browse All Artisans
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 bg-white">
          <div className="container px-4 md:px-6 mx-auto grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-8 border rounded-3xl bg-background/50 text-center space-y-4 shadow-sm">
              <div className="mx-auto p-3 bg-secondary/20 rounded-2xl w-fit text-secondary">
                <ShieldCheck className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold">Verified Pros</h3>
              <p className="text-muted-foreground leading-relaxed">
                Every artisan on FixAm is manually verified by our team to ensure quality and safety.
              </p>
            </div>
            <div className="p-8 border rounded-3xl bg-background/50 text-center space-y-4 shadow-sm">
              <div className="mx-auto p-3 bg-secondary/20 rounded-2xl w-fit text-secondary">
                <Smartphone className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold">Instant Contact</h3>
              <p className="text-muted-foreground leading-relaxed">
                No middleman. Call or WhatsApp your chosen professional directly with a single click.
              </p>
            </div>
            <div className="p-8 border rounded-3xl bg-background/50 text-center space-y-4 shadow-sm">
              <div className="mx-auto p-3 bg-secondary/20 rounded-2xl w-fit text-secondary">
                <Wrench className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold">Local Expertise</h3>
              <p className="text-muted-foreground leading-relaxed">
                Specifically built for Berekum. We know the neighborhoods and the best hands around.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-white px-4 md:px-6 text-center">
        <p className="text-sm text-muted-foreground">
          © 2024 FixAm Ghana. All rights reserved.
        </p>
      </footer>
    </div>
  );
}