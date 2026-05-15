
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getProviderData } from '@/lib/provider';
import type { Provider } from '@/lib/types';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import StarRating from '@/components/StarRating';
import { CheckCircle, Clock, Hand, MapPin, Star as StarIcon, UserCheck, User as UserIcon, AlertTriangle, MessageCircle } from 'lucide-react';
import Loading from './loading';

export default function ProviderDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const impersonateId = searchParams.get('impersonate');

  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const idToken = await currentUser.getIdToken();
          // Pass impersonation ID to the data fetching function
          const { provider: providerData, error } = await getProviderData(idToken, impersonateId);

          if (error) {
            setAccountError(error);
          } else if (providerData) {
            setProvider(providerData);
          } else {
            setAccountError("An unknown error occurred while retrieving the provider account.");
          }
        } catch (e: any) {
          console.error("Error fetching provider data: ", e);
          setAccountError(e.message || 'An error occurred while fetching data.');
        }
      } else {
        setProvider(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [impersonateId]); // Rerun effect if impersonateId changes

  if (loading) {
    return <Loading />;
  }

  if (accountError) {
    return (
      <Alert variant="destructive" className="max-w-2xl mx-auto rounded-3xl">
        <AlertTitle className="font-bold">Account Error</AlertTitle>
        <AlertDescription className='space-y-4 font-medium'>
          <p>{accountError}</p>
          {!impersonateId && <Button onClick={() => router.push('/add-provider')} className="rounded-xl font-bold">List Your Business</Button>}
        </AlertDescription>
      </Alert>
    );
  }

  if (!provider) {
    return <Loading />;
  }

  if (provider.status !== 'approved' && !impersonateId) {
    return (
        <Card className="max-w-2xl mx-auto border-none shadow-xl rounded-[40px] overflow-hidden">
            <div className="h-2 bg-yellow-500 w-full" />
            <CardHeader className="p-10">
                <CardTitle className="flex items-center gap-3 text-3xl font-black font-headline">
                    {provider.status === 'pending' ? <Clock className="h-8 w-8 text-yellow-500" /> : <Hand className="h-8 w-8 text-destructive" />}
                     Application {provider.status.charAt(0).toUpperCase() + provider.status.slice(1)}
                </CardTitle>
                <CardDescription className="text-lg font-medium">Welcome to the family, {provider.name}!</CardDescription>
            </CardHeader>
            <CardContent className="px-10 pb-10">
                <Alert variant={provider.status === 'pending' ? 'default' : 'destructive'} className="rounded-[24px] border-2 bg-muted/30">
                    <AlertTitle className="font-bold text-lg">Your account status needs attention.</AlertTitle>
                    <AlertDescription className="text-base font-medium mt-2 leading-relaxed">
                        {provider.status === 'pending' 
                        ? 'Our admin team is currently reviewing your business listing. You will be notified via WhatsApp once your account is fully verified and approved.'
                        : `Your provider account has been ${provider.status}. Please contact the GetFixam support team for more information.`}
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
  }

  const StatCard = ({ title, value, icon: Icon, description, children }: { title: string, value?: string | number, icon: React.ElementType, description?: string, children?: React.ReactNode }) => (
    <Card className="border-none shadow-sm rounded-3xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-black uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
        <div className="bg-muted p-2 rounded-xl">
            <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {value !== undefined && <div className="text-3xl font-black tracking-tight">{value}</div>}
        {children}
        {description && <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-1">{description}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-10">
      {impersonateId && (
        <Alert variant='default' className='bg-yellow-50 border-yellow-200 text-yellow-800 rounded-3xl p-6'>
          <UserIcon className="h-5 w-5 !text-yellow-800" />
          <AlertTitle className="font-bold text-lg">Admin Impersonation Mode</AlertTitle>
          <AlertDescription className="text-base font-medium">
            You are currently viewing the dashboard for <strong>{provider.name}</strong>.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
            <div className="inline-flex items-center rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary mb-3">
                <div className={`h-2 w-2 rounded-full mr-2 ${provider.subscriptionActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                {provider.subscriptionActive ? 'Visible to Clients' : 'Hidden from Clients'}
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-headline tracking-tight">Akwaaba, {provider.name.split(' ')[0]}!</h1>
            <p className="text-muted-foreground text-lg font-medium mt-1">Here is a snapshot of your business performance today.</p>
        </div>
        <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl font-bold h-12" onClick={() => router.push('/provider/profile')}>
                Edit Profile
            </Button>
        </div>
      </div>

      {!provider.subscriptionActive && (
          <Card className="border-none shadow-xl rounded-[40px] bg-red-50 border-2 border-red-100 overflow-hidden">
              <div className="h-2 bg-red-600 w-full" />
              <CardContent className="p-10">
                  <div className="flex flex-col md:flex-row gap-8 items-center text-center md:text-left">
                      <div className="bg-red-100 p-6 rounded-[32px] shrink-0 shadow-inner">
                          <AlertTriangle className="h-12 w-12 text-red-600" />
                      </div>
                      <div className="space-y-4 flex-1">
                          <h2 className="text-3xl font-black text-red-900 font-headline leading-tight">Subscription Payment Required</h2>
                          <p className="text-red-800/80 text-lg font-medium leading-relaxed max-w-2xl">
                              Your account is approved, but your business is currently <b>hidden from clients</b>. Please settle your monthly subscription fees to start receiving job requests.
                          </p>
                          <div className="flex flex-wrap justify-center md:justify-start gap-4">
                              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold h-14 px-8 rounded-2xl shadow-lg shadow-red-200">
                                  <MessageCircle className="mr-2 h-5 w-5" />
                                  Contact Admin for Payment
                              </Button>
                          </div>
                      </div>
                  </div>
              </CardContent>
          </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Average Rating" icon={StarIcon}>
          <div className="flex items-center gap-2 mt-1">
            <div className="text-3xl font-black tracking-tight">{provider.rating.toFixed(1)}</div>
            <StarRating rating={provider.rating} size={16} showText={false} />
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">From {provider.reviewCount} neighbor reviews</p>
        </StatCard>
        <StatCard title="Total Engagement" value={provider.reviewCount} icon={UserCheck} description="Completed feedbacks" />
        <StatCard title="Service Area" value={provider.location.zone} icon={MapPin} description={`${provider.location.city} Regional Tenant`} />
        <StatCard title="Verification" icon={CheckCircle}>
            <div className="mt-1">
                {provider.verified ? (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none font-black text-[10px] rounded-lg h-7 px-3">VERIFIED PRO</Badge>
                ) : (
                    <Badge variant="secondary" className="font-black text-[10px] rounded-lg h-7 px-3">PENDING VETTING</Badge>
                )}
            </div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Identity & Skill Check</p>
        </StatCard>
      </div>
      
      <Card className="border-none shadow-sm rounded-[40px] overflow-hidden">
        <CardHeader className="p-10 border-b bg-muted/5">
          <CardTitle className="text-2xl font-black font-headline">Business Growth</CardTitle>
          <CardDescription className="text-base font-medium">Follow these steps to increase your visibility on FixAm.</CardDescription>
        </CardHeader>
        <CardContent className="p-10 space-y-6">
          <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/10 group hover:bg-primary/10 transition-colors cursor-pointer" onClick={() => router.push('/provider/services')}>
                  <h3 className="text-xl font-bold font-headline mb-2">Specialized Services</h3>
                  <p className="text-muted-foreground font-medium mb-6">List exactly what you can fix so customers can find you via search.</p>
                  <Button variant="default" className="rounded-xl font-bold w-full h-12 shadow-lg shadow-primary/10">Manage Services</Button>
              </div>
              <div className="p-8 rounded-[32px] bg-secondary/5 border border-secondary/10 group hover:bg-secondary/10 transition-colors cursor-pointer" onClick={() => router.push('/provider/availability')}>
                  <h3 className="text-xl font-bold font-headline mb-2">Active Hours</h3>
                  <p className="text-muted-foreground font-medium mb-6">Keep your schedule updated to show as 'Available' on the map.</p>
                  <Button variant="secondary" className="rounded-xl font-bold w-full h-12 shadow-lg shadow-secondary/10">Set Availability</Button>
              </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
