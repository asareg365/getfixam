'use server';

import { requireAdmin } from '@/lib/admin-guard';
import { adminDb } from '@/lib/firebase-admin';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { Service } from '@/lib/types';

async function getServices(): Promise<Service[]> {
  const snapshot = await adminDb.collection('services').orderBy('name').get();
  if (snapshot.empty) return [];
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name ?? 'Unknown Service',
      slug: data.slug ?? 'unknown',
      icon: data.icon ?? 'Wrench',
      active: data.active ?? false,
      basePrice: data.basePrice ?? 0,
      currency: data.currency ?? 'GHS',
      maxSurge: data.maxSurge ?? 1.5,
      minSurge: data.minSurge ?? 1.0,
    } as Service;
  });
}

export default async function ServicesPage() {
    await requireAdmin();
    const services = await getServices();

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Manage Services</h1>
                    <p className="text-muted-foreground">Add, edit, or deactivate service categories and pricing.</p>
                </div>
                <Button asChild>
                    <Link href="/admin/services/new">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Service
                    </Link>
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Service Categories & Pricing</CardTitle>
                    <CardDescription>A list of all service categories and their pricing models.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Service Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Base Price (GHS)</TableHead>
                                    <TableHead className="text-right">Max Surge</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {services.map((service) => (
                                <TableRow key={service.id}>
                                    <TableCell className="font-medium">{service.name}</TableCell>
                                    <TableCell>
                                        <Badge variant={service.active ? 'default' : 'outline'} className={service.active ? 'bg-green-600' : ''}>
                                            {service.active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{service.basePrice.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-mono">{service.maxSurge}x</TableCell>
                                    <TableCell className="text-right">
                                         <Button variant="ghost" size="icon">
                                            <MoreHorizontal className="h-4 w-4" />
                                         </Button>
                                    </TableCell>
                                </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                     {services.length === 0 && (
                        <div className="border-2 border-dashed rounded-lg p-12 text-center mt-4">
                            <h2 className="text-xl font-semibold">No Services Found</h2>
                            <p className="mt-2 text-muted-foreground">
                                Click "Add Service" to create your first service category.
                            </p>
                        </div>
                     )}
                </CardContent>
            </Card>
        </div>
    );
}
