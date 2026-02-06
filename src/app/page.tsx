import Link from 'next/link';
import { Wrench, ShieldCheck, Smartphone, Search, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="/">
          <Wrench className="h-6 w-6 text-primary" />
          <span className="ml-2 font-bold text-xl tracking-tight text-primary font-headline">FixAm Ghana</span>
        </Link>
        <nav className="ml-auto flex gap-4 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors hidden sm:inline-block" href="/admin/login">
            Admin Access
          </Link>
          <Button asChild className="rounded-full font-bold">
            <Link href="/add-provider">List Your Business</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-48 bg-gradient-to-b from-primary/10 to-transparent">
          <div className="container px-4 md:px-6 mx-auto text-center space-y-8">
            <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl md:text-7xl text-primary font-headline">
              Find Trusted Artisans <br className="hidden md:inline" /> Fast & Reliable
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-2xl">
              Verified professionals for every repair. Connect directly with the best skills in your neighborhood.
            </p>
            
            <div className="max-w-md mx-auto flex gap-2 p-2 bg-white rounded-full shadow-xl border border-primary/20">
              <Input 
                className="border-none bg-transparent focus-visible:ring-0 text-lg h-12" 
                placeholder="What service do you need?" 
              />
              <Button size="icon" className="rounded-full h-12 w-12 shrink-0">
                <Search className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Button asChild size="lg" className="rounded-full h-14 px-8 text-lg font-bold shadow-lg shadow-primary/20">
                <Link href="/browse">
                  Browse All Artisans
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-24 bg-white">
          <div className="container px-4 mx-auto grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="p-8 border rounded-3xl bg-background/50 space-y-4 transition-all hover:shadow-md">
              <div className="p-3 bg-secondary/20 rounded-2xl w-fit text-secondary">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold font-headline">Verified Pros</h3>
              <p className="text-muted-foreground">Every artisan is vetted for your peace of mind and quality guarantee.</p>
            </div>
            <div className="p-8 border rounded-3xl bg-background/50 space-y-4 transition-all hover:shadow-md">
              <div className="p-3 bg-secondary/20 rounded-2xl w-fit text-secondary">
                <Smartphone className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold font-headline">Direct Contact</h3>
              <p className="text-muted-foreground">Call or WhatsApp artisans directly. We remove the middleman to save you time.</p>
            </div>
            <div className="p-8 border rounded-3xl bg-background/50 space-y-4 transition-all hover:shadow-md">
              <div className="p-3 bg-secondary/20 rounded-2xl w-fit text-secondary">
                <Wrench className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold font-headline">Local Experts</h3>
              <p className="text-muted-foreground">Connecting you with specialized skills in your local area for the fastest response.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-white text-center">
        <p className="text-sm text-muted-foreground">© 2024 FixAm Ghana. Built for community reliance.</p>
      </footer>
    </div>
  );
}