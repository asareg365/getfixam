import ProviderList from '@/components/ProviderList';
import { getCategoryBySlug, getProviders } from '@/lib/services';
import { getZones } from '@/lib/data';
import { notFound } from 'next/navigation';
import PublicLayout from '@/components/layout/PublicLayout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';

export const dynamic = "force-dynamic";

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const category = await getCategoryBySlug(params.slug);

    if (!category) {
        notFound();
    }

    // Fetch providers and zones on the server for performance and reliability
    const [providers, zones] = await Promise.all([
        getProviders(params.slug),
        getZones()
    ]);

    return (
        <PublicLayout>
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary transition-colors group">
                        <Link href="/">
                            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            <span className="font-bold">Back to Home</span>
                        </Link>
                    </Button>
                    {params.slug !== 'all' && (
                        <>
                            <span className="text-muted-foreground/30">|</span>
                            <Button variant="ghost" asChild className="hover:bg-transparent hover:text-primary transition-colors">
                                <Link href="/category/all">
                                    <span className="font-bold">All Categories</span>
                                </Link>
                            </Button>
                        </>
                    )}
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tight leading-tight">
                        {category.name}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mt-4 font-medium max-w-2xl mx-auto">
                        {params.slug === 'all' 
                            ? "Browse our complete directory of trusted local professionals in Berekum." 
                            : `Find and connect with the best ${category.name.toLowerCase()} professionals in your neighborhood.`}
                    </p>
                </div>
                
                <div className="bg-white/50 rounded-[40px] p-4 md:p-8 border border-primary/5 shadow-sm">
                    {/* Pass pre-fetched data to the list component */}
                    <ProviderList 
                        slug={params.slug} 
                        initialProviders={providers} 
                        zones={zones} 
                    />
                </div>
            </div>
        </PublicLayout>
    );
}
