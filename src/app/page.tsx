import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Wrench, Shield, Smartphone } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <Link className="flex items-center justify-center" href="/">
          <Wrench className="h-6 w-6 text-primary" />
          <span className="ml-2 font-bold text-xl font-space">FixAm Ghana</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-primary transition-colors" href="/admin/login">
            Admin
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-primary/5">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none font-space text-primary">
                  Find Trusted Local Artisans in Berekum
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Connect with verified plumbers, electricians, and mechanics in your neighborhood. Quick, reliable, and just a call away.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild size="lg" className="rounded-full">
                  <Link href="/browse">
                    Browse Artisans
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" className="rounded-full" asChild>
                  <Link href="/register">List Your Business</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-2xl bg-white shadow-sm">
                <Shield className="h-12 w-12 text-secondary" />
                <h3 className="text-xl font-bold font-space">Verified Pros</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Every artisan on our platform is manually verified by our team for your safety.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-2xl bg-white shadow-sm">
                <Smartphone className="h-12 w-12 text-secondary" />
                <h3 className="text-xl font-bold font-space">Easy Contact</h3>
                <p className="text-sm text-muted-foreground text-center">
                  Call or WhatsApp artisans directly with one click. No middleman, no fees.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 border p-6 rounded-2xl bg-white shadow-sm">
                <Wrench className="h-12 w-12 text-secondary" />
                <h3 className="text-xl font-bold font-space">All Categories</h3>
                <p className="text-sm text-muted-foreground text-center">
                  From tailoring to masonry, find the right professional for any task.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-muted-foreground">© 2024 FixAm Ghana. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="/terms">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="/privacy">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
}