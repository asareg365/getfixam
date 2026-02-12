'use client';

import { useEffect, useState, useTransition } from 'react';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getProviderData } from '@/lib/provider';
import { updateProviderProfile } from '../actions';
import type { Provider } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

function ProfileSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-40" />
            <Card>
                <CardHeader>
                    <CardTitle>Edit Your Profile</CardTitle>
                    <CardDescription>Update your business name, location, and contact information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2"><Label>Business Name</Label><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Label>Phone Number (Read-only)</Label><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Label>WhatsApp Number</Label><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Label>Zone</Label><Skeleton className="h-10 w-full" /></div>
                    <div className="space-y-2"><Label>Digital Address</Label><Skeleton className="h-10 w-full" /></div>
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-24" />
                </CardFooter>
            </Card>
        </div>
    );
}

export default function ProviderProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [formState, setFormState] = useState({ name: '', whatsapp: '', zone: '', digitalAddress: '' });
  
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
                    setFormState({
                        name: providerData.name,
                        whatsapp: providerData.whatsapp,
                        zone: providerData.location.zone,
                        digitalAddress: providerData.digitalAddress,
                    });
                }
            } catch (e: any) {
                 toast({ title: 'Error loading profile', description: e.message, variant: 'destructive' });
            }
        }
        setLoading(false);
    });
     return () => unsubscribe();
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormState(prev => ({ ...prev, [name]: value }));
  };

  async function handleSave() {
    if (!user) {
        toast({ title: 'Not Authenticated', description: 'Please log in again.', variant: 'destructive' });
        return;
    }

    startSavingTransition(async () => {
        try {
            const idToken = await user.getIdToken();
            const res = await updateProviderProfile(idToken, formState);

            if (res.success) {
                toast({ title: 'Profile Updated', description: 'Your changes have been saved successfully.' });
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
    return <ProfileSkeleton />;
  }
  
  if (!provider) {
      return (
        <Card>
            <CardHeader><CardTitle>Profile Not Found</CardTitle></CardHeader>
            <CardContent><p>We could not find your provider profile. Please contact support.</p></CardContent>
        </Card>
      );
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center">
            <Button variant="ghost" asChild className="-ml-4 text-muted-foreground hover:text-primary">
                <Link href="/provider/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>

        <Card>
            <CardHeader>
            <CardTitle>Edit Your Profile</CardTitle>
            <CardDescription>Update your business name, location, and contact information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
            
            <div className="space-y-2">
                <Label htmlFor="name">Business Name</Label>
                <Input
                id="name"
                name="name"
                value={formState.name}
                onChange={handleInputChange}
                />
            </div>
            
            <div className="space-y-2">
                <Label>Phone Number (Read-only)</Label>
                <Input
                value={provider.phone}
                readOnly
                disabled
                className="bg-muted/50"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp Number</Label>
                <Input
                id="whatsapp"
                name="whatsapp"
                type="tel"
                value={formState.whatsapp}
                onChange={handleInputChange}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="zone">Zone</Label>
                <Input
                id="zone"
                name="zone"
                value={formState.zone}
                onChange={handleInputChange}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="digitalAddress">Digital Address</Label>
                <Input
                id="digitalAddress"
                name="digitalAddress"
                value={formState.digitalAddress}
                onChange={handleInputChange}
                />
            </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
      </div>
  );
}
