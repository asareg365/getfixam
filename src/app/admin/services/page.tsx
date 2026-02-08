'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import type { Service } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/services');
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch services');
        }
        const data = await res.json();
        setServices(data.services || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
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
                {loading && <p>Loading...</p>}
                {error && <p className="text-destructive">Error: {error}</p>}
                {!loading && !error && (
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
                )}
                 {services.length === 0 && !loading && !error && (
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
