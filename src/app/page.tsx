import Link from 'next/link';
import Image from 'next/image';
import { Wrench, ShieldCheck, Smartphone, ArrowRight, Search, MapPin, CheckCircle2, Facebook, Instagram, MessageCircle, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CATEGORIES } from '@/lib/data';
import CategoryCard from '@/components/CategoryCard';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-10 h-20 flex items-center border-b bg-white">
        <Link className="flex items-center justify-center group" href="/">
            <Image src="/logo.png" alt="GetFixam Logo" width={135} height={60} />
        </Link>
        <nav className="ml-auto flex gap-6 items-center">
          <Link className="text-sm font-semibold hover:text-primary transition-colors hidden md:inline-block" href="/category/all">
            Browse Categories
          </Link>
          <Button asChild className="rounded-full px-6 font-bold shadow-lg shadow-primary/20">
            <Link href="/provider/login">
              Artisan Login
            </Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-b from-primary/10 via-background to-transparent overflow-hidden relative">
          <div className="container px-4 md:px-6 mx-auto relative z-10 text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-8">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse" />
              Trusted Artisans you can find
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-primary font-headline max-w-5xl mx-auto leading-[1.1] mb-8">
             Adwumayɛfoɔ a wotumi de wo ho to wɔn so.
            </h1>
            <p className="mx-auto max-w-[700px] text-muted-foreground text-lg md:text-2xl font-medium leading-relaxed mb-12">
              Connect directly with verified plumbers, electricians, and professionals in your neighborhood. Wo hia mmoa anaa? Find the best artisan here.
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
          </div>
          
          <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
        </section>

        {/* Categories Section */}
        <section className="py-24 bg-white">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black font-headline text-primary mb-4">Browse by Category</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Whatever the job, we have a verified professional ready to help you fix it today.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {CATEGORIES.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Button asChild variant="outline" className="rounded-2xl px-8 font-bold border-2">
                <Link href="/category/all">View All Categories</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-secondary/10">
          <div className="container px-4 mx-auto">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="bg-white p-10 rounded-[32px] shadow-sm hover:shadow-xl transition-shadow border border-primary/5">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mb-6">
                  <ShieldCheck className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold font-headline mb-4">Vetted Local Pros</h3>
                <p className="text-muted-foreground leading-relaxed">We manually verify local artisans to ensure your safety and quality of service.</p>
              </div>
              <div className="bg-white p-10 rounded-[32px] shadow-sm hover:shadow-xl transition-shadow border border-primary/5">
                <div className="bg-secondary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-secondary mb-6">
                  <Smartphone className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold font-headline mb-4">Direct Contact</h3>
                <p className="text-muted-foreground leading-relaxed">No middlemen. Chat directly via WhatsApp or call local experts to discuss your repairs.</p>
              </div>
              <div className="bg-white p-10 rounded-[32px] shadow-sm hover:shadow-xl transition-shadow border border-primary/5">
                <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center text-primary mb-6">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold font-headline mb-4">Verified Reviews</h3>
                <p className="text-muted-foreground leading-relaxed">Real reviews from your neighbors. Know who you're hiring before they arrive.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-white">
          <div className="container px-4 mx-auto text-center">
            <h2 className="text-4xl md:text-6xl font-black font-headline mb-8">Are you a skilled Artisan?</h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto mb-12">
              Join hundreds of professionals in Berekum and grow your business with GetFixam Ghana.
            </p>
            <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 rounded-2xl h-16 px-12 text-lg font-bold shadow-2xl">
              <Link href="/add-provider">
                List Your Business
                <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t bg-muted/30 text-center">
        <div className="container px-4 mx-auto">
          <div className="flex items-center justify-center mb-6">
            <Image src="/logo.png" alt="GetFixam Logo" width={135} height={60} />
          </div>

          <div className="flex justify-center gap-6 mb-8">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors p-3 bg-white rounded-full shadow-sm" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors p-3 bg-white rounded-full shadow-sm" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors p-3 bg-white rounded-full shadow-sm" aria-label="TikTok">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tiktok">
                <path d="M9 12a4 4 0 1 0 4 4V2a5 5 0 0 0 5 5"/>
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors p-3 bg-white rounded-full shadow-sm" aria-label="WhatsApp">
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>

          <div className="flex justify-center gap-8 text-sm font-bold text-muted-foreground mb-8">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/admin/login" className="hover:text-primary transition-colors flex items-center">
              <ShieldCheck className="mr-1 h-4 w-4" />
              Admin Access
            </Link>
          </div>
          <p className="text-xs text-muted-foreground font-medium">© {new Date().getFullYear()} GetFixam Ghana. Connecting quality local skills with customers.</p>
        </div>
      </footer>
    </div>
  );
}
