import ProviderList from '@/components/ProviderList';
import { getCategoryBySlug, getProviders } from '@/lib/services';
import { getZones, getCityConfig } from '@/lib/constants';
import { notFound } from 'next/navigation';
import PublicLayout from '@/components/layout/PublicLayout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const dynamic = "force-dynamic";

type PageProps = {
    params: Promise<{ slug: string; city: string }>
}

export default async function CategoryPage({ params }: PageProps) {
    const { slug, city } = await params;
    const category = await getCategoryBySlug(slug);
    const config = getCityConfig(city);

    if (!category) {
        notFound();
    }

    const [providers, zones] = await Promise.all([
        getProviders(city, slug),
        getZones(city)
    ]);

    return (
        <PublicLayout>
            <div className="container mx-auto px-4 py-8 md:py-12">
                <div className="flex flex-wrap items-center gap-4 mb-8">
                    <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary transition-colors group">
                        <Link href={`/${city}`}>
                            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                            <span className="font-bold">Back to Home</span>
                        </Link>
                    </Button>
                    {slug !== 'all' && (
                        <>
                            <span className="text-muted-foreground/30">|</span>
                            <Button variant="ghost" asChild className="hover:bg-transparent hover:text-primary transition-colors">
                                <Link href={`/${city}/category/all`}>
                                    <span className="font-bold">All Categories</span>
                                </Link>
                            </Button>
                        </>
                    )}
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-6xl font-black font-headline text-primary tracking-tight leading-tight">
                        {category.name} in {config.name}
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground mt-4 font-medium max-w-2xl mx-auto">
                        {slug === 'all' 
                            ? `Browse our complete directory of trusted local professionals in ${config.name}.` 
                            : `Find and connect with the best ${category.name.toLowerCase()} professionals in ${config.name}.`}
                    </p>
                </div>
                
                <div className="bg-white/50 rounded-[40px] p-4 md:p-8 border border-primary/5 shadow-sm">
                    <ProviderList 
                        slug={slug} 
                        initialProviders={providers} 
                        zones={zones} 
                    />
                </div>
            </div>
        </PublicLayout>
    );
}
