'use client';

import { useState, useEffect, useTransition } from 'react';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getProviderData } from '@/lib/provider';
import { updateProviderServices } from '../actions';
import type { Provider } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft, Plus, Trash2, CheckCircle2, Wrench } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

type ServiceItem = { name: string; active: boolean; price?: number };

export default function ProviderServicesPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [newServiceName, setNewServiceName] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [isSaving, startSavingTransition] = useTransition();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            try {
                const idToken = await currentUser.getIdToken();
                const { provider: providerData, error } = await getProviderData(idToken);
                if (error) throw new Error(error);
                if (providerData) {
                    setProvider(providerData);
                    setServices(providerData.services || []);
                }
            } catch (e: any) {
                 toast({ title: 'Error loading services', description: e.message, variant: 'destructive' });
            }
        }
        setLoading(false);
    });
     return () => unsubscribe();
  }, []);

  const handleAddService = () => {
      if (!newServiceName.trim()) return;
      if (services.some(s => s.name.toLowerCase() === newServiceName.trim().toLowerCase())) {
          toast({ title: 'Duplicate Service', description: 'This service is already in your list.' });
          return;
      }
      setServices([...services, { name: newServiceName.trim(), active: true }]);
      setNewServiceName('');
  };

  const handleRemoveService = (index: number) => {
      setServices(services.filter((_, i) => i !== index));
  };

  async function handleSave() {
    if (!user) {
        toast({ title: 'Not Authenticated', description: 'Please log in again.', variant: 'destructive' });
        return;
    }

    startSavingTransition(async () => {
        try {
            const idToken = await user.getIdToken();
            const res = await updateProviderServices(idToken, services);

            if (res.success) {
                toast({ title: 'Services Updated', description: 'Your specialized service list has been saved.' });
                router.refresh();
            } else {
                throw new Error(res.error || 'An unknown error occurred.');
            }
        } catch (e: any) {
            toast({ title: 'Update Failed', description: e.message, variant: 'destructive' });
        }
    });
  }

  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-40" />
            <Card>
                <CardHeader><Skeleton className="h-20 w-full" /></CardHeader>
                <CardContent className="space-y-4"><Skeleton className="h-12 w-full" /><Skeleton className="h-12 w-full" /></CardContent>
            </Card>
        </div>
    );
  }
  
  if (!provider) {
      return (
        <Card>
            <CardHeader><CardTitle>Account Not Found</CardTitle></CardHeader>
            <CardContent><p>Please log in to manage your services.</p></CardContent>
        </Card>
      );
  }

  return (
      <div className="space-y-8">
        <div className="flex items-center">
            <Button variant="ghost" asChild className="-ml-4 text-muted-foreground hover:text-primary">
                <Link href="/provider/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
                <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-2xl">
                                <Wrench className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black font-headline">Manage Your Services</CardTitle>
                                <CardDescription className="text-base font-medium">Add specialized skills to help customers find you easily.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                        <div className="space-y-4">
                            <Label className="text-lg font-bold">Primary Category</Label>
                            <div className="p-4 bg-muted/30 rounded-2xl border border-muted-foreground/10 flex items-center justify-between">
                                <span className="font-bold text-lg">{provider.category}</span>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none">Main Role</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">Primary category is verified by administration and cannot be changed here.</p>
                        </div>

                        <div className="space-y-6">
                            <Label className="text-lg font-bold">Specialized Services</Label>
                            <div className="flex gap-3">
                                <Input 
                                    placeholder="e.g. Emergency Leak Repair" 
                                    value={newServiceName}
                                    onChange={(e) => setNewServiceName(e.target.value)}
                                    className="h-14 rounded-2xl border-muted-foreground/20 text-lg"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddService()}
                                />
                                <Button onClick={handleAddService} className="h-14 w-14 rounded-2xl shadow-lg shadow-primary/20 shrink-0">
                                    <Plus className="h-6 w-6" />
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {services.length > 0 ? (
                                    services.map((service, index) => (
                                        <div key={index} className="flex items-center justify-between p-5 bg-white border rounded-2xl shadow-sm group hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="bg-green-100 p-1.5 rounded-full">
                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                </div>
                                                <span className="font-bold text-lg">{service.name}</span>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => handleRemoveService(index)}
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 border-2 border-dashed rounded-[32px] bg-muted/10">
                                        <p className="text-muted-foreground font-medium">No specialized services listed yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="p-8 bg-muted/5 border-t">
                        <Button onClick={handleSave} disabled={isSaving} className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl shadow-primary/20">
                            {isSaving ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : null}
                            Save All Changes
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="border-none shadow-sm rounded-3xl bg-secondary/10">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold font-headline">Why add services?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex gap-3">
                            <div className="bg-white p-2 h-fit rounded-lg shadow-sm">
                                <CheckCircle2 className="h-4 w-4 text-secondary" />
                            </div>
                            <p className="text-sm font-medium">Helps customers understand exactly what you can fix.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="bg-white p-2 h-fit rounded-lg shadow-sm">
                                <CheckCircle2 className="h-4 w-4 text-secondary" />
                            </div>
                            <p className="text-sm font-medium">Increases your visibility in specific keyword searches.</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="bg-white p-2 h-fit rounded-lg shadow-sm">
                                <CheckCircle2 className="h-4 w-4 text-secondary" />
                            </div>
                            <p className="text-sm font-medium">Makes your profile look more professional and complete.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
  );
}
