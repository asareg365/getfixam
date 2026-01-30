import { requireAdmin } from '@/lib/admin-guard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AddServiceForm from './form';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AddServicePage() {
  await requireAdmin();
  
  return (
    <div>
        <div className="mb-4">
            <Button variant="ghost" asChild>
                <Link href="/admin/services">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Services
                </Link>
            </Button>
        </div>
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="text-3xl font-headline">Add New Service</CardTitle>
                <CardDescription>
                    Create a new service category that artisans can be listed under.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <AddServiceForm />
            </CardContent>
        </Card>
    </div>
  );
}
