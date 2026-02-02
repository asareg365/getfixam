'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getProviderData } from '@/lib/provider';
import type { Provider } from '@/lib/types';
import { getAuth, onIdTokenChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import StarRating from '@/components/StarRating';
import { CheckCircle, Clock, Hand, MapPin, Star as StarIcon, UserCheck } from 'lucide-react';
import Loading from './loading';

export default function ProviderDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);

  useEffect(() => {
    // Use onIdTokenChanged to handle token refresh gracefully
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          const { provider: providerData, error } = await getProviderData(idToken);

          if (error) {
            setAccountError(error);
          } else if (providerData) {
            setProvider(providerData);
          } else {
            setAccountError("An unknown error occurred while retrieving your account.");
          }
        } catch (e: any) {
          console.error("Error fetching provider data: ", e);
          setAccountError(e.message || 'An error occurred while fetching your data.');
        }
      } else {
        // If no user, middleware will handle redirect, but we can stop loading.
        setProvider(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (accountError) {
      return (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertTitle>Account Error</AlertTitle>
            <AlertDescription className='space-y-4'>
                <p>{accountError}</p>
                <p>If you have just registered, your account may still be under review.</p>
                 <Button onClick={() => router.push('/add-provider')}>Create a Business Listing</Button>
            </AlertDescription>
        </Alert>
      )
  }

  if (!provider) {
    // This state can be hit briefly during redirect or if there's an issue.
    return <Loading />;
  }
  
  if (provider.status !== 'approved') {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {provider.status === 'pending' ? <Clock className="h-6 w-6 text-yellow-500" /> : <Hand className="h-6 w-6 text-destructive" />}
                     Application {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                </CardTitle>
                <CardDescription>Welcome, {provider.name}!</CardDescription>
            </CardHeader>
            <CardContent>
                <Alert variant={provider.status === 'pending' ? 'default' : 'destructive'}>
                    <AlertTitle>There is an issue with your account.</AlertTitle>
                    <AlertDescription>
                        {provider.status === 'pending' 
                        ? 'Our admin team is currently reviewing your business listing. You will be notified once it is approved. Thank you for your patience.'
                        : `Your provider account has been ${provider.status}. Please contact an administrator for more information and next steps.`}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
  }
  
  const StatCard = ({ title, value, icon: Icon, description, children }: { title: string, value?: string | number, icon: React.ElementType, description?: string, children?: React.ReactNode }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {value !== undefined && <div className="text-2xl font-bold">{value}</div>}
        {children}
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold font-headline">Welcome back, {provider.name}!</h1>
            <p className="text-muted-foreground">Here's an overview of your provider profile.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Average Rating" icon={StarIcon}>
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold">{provider.rating.toFixed(1)}</div>
                <StarRating rating={provider.rating} size={16} showText={false} />
              </div>
              <p className="text-xs text-muted-foreground">Based on {provider.reviewCount} reviews</p>
            </StatCard>
            <StatCard title="Total Reviews" value={provider.reviewCount} icon={UserCheck} description="Number of customer reviews" />
            <StatCard title="Location" value={provider.location.zone} icon={MapPin} description={`${provider.location.city}, ${provider.location.region}`} />
            <StatCard title="Verification" value={provider.verified ? 'Verified' : 'Not Verified'} icon={CheckCircle} description="Admin has confirmed your details" />
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Next Steps</CardTitle>
                <CardDescription>Complete your profile to attract more customers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert>
                    <AlertTitle>Complete Your Profile</AlertTitle>
                    <AlertDescription>
                       Customers are more likely to contact providers with a complete profile. Take a few minutes to add your services and set your availability.
                       <div className="flex gap-4 mt-4">
                           <Button size="sm" onClick={() => router.push('/provider/services')}>Add Services</Button>
                           <Button size="sm" variant="outline" onClick={() => router.push('/provider/availability')}>Set Availability</Button>
                       </div>
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    </div>
  );
}
