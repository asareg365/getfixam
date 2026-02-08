import Link from 'next/link';
import { Wrench, ShieldCheck, Smartphone, ArrowRight, Search, MapPin, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-10 h-20 flex items-center border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center group" href="/">
          <div className="bg-primary p-2 rounded-xl group-hover:rotate-12 transition-transform">
            <Wrench className="h-6 w-6 text-white" />
          </div>
          <span className="ml-3 font-bold text-2xl tracking-tight text-primary font-headline">FixAm</span>
        </Link>
        <nav className="ml-auto flex gap-6 items-center">
          <Link className="text-sm font-semibold hover:text-primary transition-colors hidden md:inline-block" href="/admin">
            Admin Portal
          </Link>
          <Button asChild className="rounded-full px-6 font-bold shadow-lg shadow-primary/20">
            <Link href="/provider/login">
              Artisan Login
            </Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-20 md:py-32 bg-gradient-to-b from-primary/10 via-background to-transparent overflow-hidden relative">
          <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
              Trusted Artisans (Artisans a yedi won ho ni)
            </div>
            <h1 className="text-5xl font-black tracking-tighter sm:text-7xl md:text-8xl text-primary font-headline max-w-4xl mx-auto leading-[1] mb-8">
             Adwumayefo a wotumi de wo ho to won so ewo wo mpata mu. 
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-2xl font-medium leading-relaxed mb-12">
              Connect directly with verified plumbers, electricians, and professionals. Quality service guaranteed at your doorstep. Wo hia mmoa anaa? Find the best artisan here.
            </p>
            
            <div className="w-full max-w-3xl mx-auto flex flex-col md:flex-row gap-3 p-3 bg-white rounded-[32px] shadow-2xl border border-primary/10 mb-12">
              <form action="/category/all" className="flex-1 flex flex-col md:flex-row gap-3">
                <div className="flex-1 flex items-center px-4 border-b md:border-b-0 md:border-r border-muted">
                  <Search className="h-5 w-5 text-muted-foreground mr-3" />
                  <Input 
                    name="query"
                    className="border-none bg-transparent focus-visible:ring-0 text-lg h-12" 
                    placeholder="Service (e.g. Plumber)" 
                  />
                </div>
                <div className="flex-1 flex items-center px-4">
                  <MapPin className="h-5 w-5 text-muted-foreground mr-3" />
                  <Input 
                    name="location"
                    className="border-none bg-transparent focus-visible:ring-0 text-lg h-12" 
                    placeholder="Area (e.g. Kato)" 
                  />
                </div>
                <Button type="submit" size="lg" className="rounded-2xl h-14 px-10 shrink-0 font-bold text-lg">
                  Find Help
                </Button>
              </form>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" variant="outline" className="rounded-2xl h-16 px-10 text-lg font-bold border-2">
                <Link href="/category/all">
                  Browse Categories
                </Link>
              </Button>
              <Button asChild size="lg" className="rounded-2xl h-16 px-10 text-lg font-bold shadow-xl shadow-primary/30">
                <Link href="/add-provider">
                  Join as Artisan
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </section>

        <section className="py-24 bg-white">
          <div className="container px-4 mx-auto">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-primary">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold font-headline">Vetted Local Pros</h3>
                <p className="text-muted-foreground leading-relaxed">We manually verify Berekum's finest artisans to ensure your safety and quality of service.</p>
              </div>
              <div className="space-y-4">
                <div className="bg-secondary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-secondary">
                  <Smartphone className="h-8 w-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold font-headline">Direct Contact</h3>
                  <p className="text-muted-foreground leading-relaxed">No middlemen. Chat directly via WhatsApp or call local experts to discuss your repairs.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-primary">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold font-headline">Verified Reviews</h3>
                <p className="text-muted-foreground leading-relaxed">Real reviews from your neighbors in Berekum. Know who you're hiring before they arrive.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-muted/30 text-center">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Wrench className="h-6 w-6 text-primary" />
            <span className="ml-2 font-bold text-xl text-primary font-headline">FixAm Ghana</span>
          </div>
          <div className="flex justify-center gap-8 text-sm font-medium text-muted-foreground mb-8">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/admin/login" className="hover:text-primary transition-colors">Admin Access</Link>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} FixAm Berekum. Connecting you with quality local skills.</p>
        </div>
      </footer>
    </div>
  );
}
