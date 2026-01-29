import { getCategories, getBerekumZones } from '@/lib/services';
import AddProviderForm from './form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import PublicLayout from '@/components/layout/PublicLayout';

export default async function AddProviderPage() {
  // Fetch dynamic data for the form from Firestore
  const categoriesData = await getCategories();
  const zones = await getBerekumZones();

  // Prepare data for the client component, ensuring it's a plain object
  const categories = categoriesData.map(cat => ({
      id: cat.id,
      name: cat.name,
  }));

  return (
    <PublicLayout>
        <div className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
            <CardTitle className="text-3xl font-headline">List your Business</CardTitle>
            <CardDescription>
                Join FixAm Ghana and connect with customers in Berekum. Fill out the form below.
            </CardDescription>
            </CardHeader>
            <CardContent>
                <AddProviderForm categories={categories} zones={zones} />
            </CardContent>
        </Card>
        </div>
    </PublicLayout>
  );
}
