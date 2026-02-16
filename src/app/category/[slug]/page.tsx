
import ProviderList from '@/components/ProviderList';
import { getCategoryBySlug } from '@/lib/services';
import { notFound } from 'next/navigation';
import PublicLayout from '@/components/layout/PublicLayout';

export const dynamic = 'force-dynamic';

export default async function CategoryPage(props: { params: Promise<{ slug: string }> }) {
    const params = await props.params;
    const category = await getCategoryBySlug(params.slug);

    if (!category) {
        notFound();
    }

    return (
        <PublicLayout>
            <div className="container mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold font-headline text-primary">{category.name}</h1>
                    <p className="text-lg text-muted-foreground mt-2">
                        Browse through the best artisans in {category.name.toLowerCase()}.
                    </p>
                </div>
                <ProviderList slug={params.slug} />
            </div>
        </PublicLayout>
    );
}
