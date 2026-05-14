import { getCategories } from '@/lib/data';
import { getZones, getCityConfig } from '@/lib/constants';
import Image from 'next/image';
import AddProviderForm from '@/app/add-provider/form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/components/layout/PublicLayout';

export const dynamic = "force-dynamic";

type PageProps = {
    params: Promise<{ city: string }>
}

export default async function AddProviderPage({ params }: PageProps) {
  const { city } = await params;
  const categoriesData = await getCategories();
  const zones = await getZones(city);
  const config = getCityConfig(city);

  const categories = categoriesData.map(cat => ({
      id: cat.id,
      name: cat.name,
  }));

  return (
    <PublicLayout>
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <Card className="max-w-2xl mx-auto border-none shadow-2xl rounded-[32px] overflow-hidden">
            <div className="h-2 bg-primary w-full" />
            <CardHeader className="p-8 md:p-12 text-center">
                <div className="flex justify-center mb-8">
                    <Image src="/logo.png" alt="GetFixam Logo" width={180} height={80} />
                </div>
                <CardTitle className="text-4xl font-extrabold font-headline text-primary tracking-tight">List your Business in {config.name}</CardTitle>
                <CardDescription className="text-lg mt-2 font-medium">
                    Join GetFixam {config.name} and connect with customers in your neighborhood. Fill out the form below.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-8 md:p-12 pt-0">
                <AddProviderForm categories={categories} zones={zones} />
            </CardContent>
        </Card>
        </div>
    </PublicLayout>
  );
}
