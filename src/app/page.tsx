import Link from 'next/link';
import { Wrench, ArrowRight, ShieldCheck, Smartphone } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="/">
          <Wrench className="h-6 w-6 text-primary" />
          <span className="ml-2 font-bold text-xl">FixAm Ghana</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/admin">
            Admin
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary/5">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-primary">
                Find Trusted Local Artisans in Berekum
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Connect with verified plumbers, electricians, and mechanics in your neighborhood. Quick, reliable, and just a call away.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link 
                  href="/browse" 
                  className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                >
                  Browse Artisans
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link 
                  href="/register" 
                  className="inline-flex h-11 items-center justify-center rounded-full border border-primary text-primary px-8 text-sm font-medium transition-colors hover:bg-primary/10"
                >
                  List Your Business
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 text-center p-6 border rounded-2xl shadow-sm">
                <ShieldCheck className="h-12 w-12 text-secondary" />
                <h3 className="text-xl font-bold">Verified Pros</h3>
                <p className="text-sm text-muted-foreground">Every artisan is manually verified for your safety.</p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center p-6 border rounded-2xl shadow-sm">
                <Smartphone className="h-12 w-12 text-secondary" />
                <h3 className="text-xl font-bold">Easy Contact</h3>
                <p className="text-sm text-muted-foreground">Call or WhatsApp directly with one click.</p>
              </div>
              <div className="flex flex-col items-center space-y-2 text-center p-6 border rounded-2xl shadow-sm">
                <Wrench className="h-12 w-12 text-secondary" />
                <h3 className="text-xl font-bold">All Categories</h3>
                <p className="text-sm text-muted-foreground">From tailoring to masonry, find the right professional.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 w-full shrink-0 border-t bg-white px-4 md:px-6 flex flex-col sm:flex-row items-center justify-between">
        <p className="text-xs text-muted-foreground">© 2024 FixAm Ghana. All rights reserved.</p>
        <div className="flex gap-4 mt-4 sm:mt-0">
          <Link className="text-xs hover:underline underline-offset-4" href="/terms">Terms</Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/privacy">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}