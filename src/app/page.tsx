import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ArrowRight } from 'lucide-react';
import { getCategories } from '@/lib/data';
import { getProviders } from '@/lib/services';
import CategoryCard from '@/components/CategoryCard';
import ProviderCard from '@/components/ProviderCard';
import type { Category, Provider } from '@/lib/types';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import PublicLayout from '@/components/layout/PublicLayout';
import { searchAction } from './actions';


export default async function BrowsePage() {
  const categories: Category[] = await getCategories();
  const featuredProviders: Provider[] = (await getProviders()).slice(0, 4);
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero');

  return (
    <PublicLayout>
        <div className="flex flex-col">
        <section className="relative w-full bg-primary/10 py-20 md:py-32">
            <div className="container mx-auto px-4 md:px-6 text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-headline tracking-tight text-primary">
                FixAm Ghana
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg md:text-xl text-foreground/80">
                "Wo nim plumber bi anaa?" Find trusted local artisans in Berekum, fast.
            </p>
            <form action={searchAction} className="mt-8 max-w-lg mx-auto flex gap-2">
                <Input
                type="search"
                name="query"
                autoComplete="off"
                placeholder="Search for a service (e.g., electrician)"
                className="flex-1 bg-background"
                aria-label="Search for a service"
                />
                <Button type="submit" size="icon" aria-label="Search">
                <Search className="h-5 w-5" />
                </Button>
            </form>
            </div>
            {heroImage && (
                <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    fill
                    className="object-cover -z-10 opacity-5"
                    data-ai-hint={heroImage.imageHint}
                    priority
                />
            )}
        </section>

        <section id="categories" className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4 md:px-6">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Browse by Category</h2>
                <p className="mt-2 text-foreground/70">Find the right professional for your job.</p>
            </div>
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
                {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
                ))}
            </div>
            </div>
        </section>

        <section className="py-16 md:py-24 bg-secondary/30">
            <div className="container mx-auto px-4 md:px-6">
            <div className="flex justify-between items-center mb-12">
                <div className='max-w-xl'>
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Featured Artisans</h2>
                <p className="mt-2 text-foreground/70">Top-rated and verified professionals in Berekum.</p>
                </div>
                <Button variant="outline" asChild className="hidden md:flex">
                    <Link href="/category/all">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
                {featuredProviders.map((provider) => (
                <ProviderCard key={provider.id} provider={provider} />
                ))}
            </div>
            <div className="mt-8 text-center md:hidden">
                <Button variant="outline" asChild>
                    <Link href="/category/all">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                </Button>
            </div>
            </div>
        </section>
        </div>
    </PublicLayout>
  );
}
