'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { doc, getDocs, collection, query, where, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Provider } from '@/lib/types';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import StarRating from '@/components/StarRating';
import { Building, CheckCircle, Clock, Contact, Hand, Info, Star as StarIcon, User as UserIcon } from 'lucide-react';
import Loading from './loading';
import { format } from 'date-fns';

export default function ProviderDashboardPage() {
  const router = useRouter();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountError, setAccountError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          // 1. First, try to find by UID
          let providerQuery = query(collection(db, 'providers'), where('authUid', '==', currentUser.uid));
          let providerSnap = await getDocs(providerQuery);
          let providerDoc;

          if (providerSnap.empty) {
            // 2. If not found, try to find by phone number (without status check)
            if (!currentUser.phoneNumber) {
                setAccountError("Your account has no phone number associated. Please contact support.");
                setLoading(false);
                return;
            }
            // In Ghana, numbers start with 0, but Firebase stores them as +233...
            // We need to match the format in the DB, which is `0...`
            const localPhoneNumber = currentUser.phoneNumber.substring(4); 
            providerQuery = query(
              collection(db, 'providers'),
              where('phone', '==', `0${localPhoneNumber}`),
            );
            providerSnap = await getDocs(providerQuery);

            if (!providerSnap.empty) {
              // 3. Found by phone! Link the UID for future logins.
              providerDoc = providerSnap.docs[0];
              await updateDoc(doc(db, 'providers', providerDoc.id), { authUid: currentUser.uid });
            } else {
                // 4. Not found by UID or Phone. They need to register.
                setAccountError("No provider account found for this phone number. Please create a listing first.");
                setLoading(false);
                return;
            }
          } else {
            providerDoc = providerSnap.docs[0];
          }
          
          const providerData = providerDoc.data();
          let categoryName = 'N/A';
          if (providerData.serviceId) {
            const serviceDoc = await getDoc(doc(db, 'services', providerData.serviceId));
            if(serviceDoc.exists()) {
                categoryName = serviceDoc.data().name;
            }
          }

          setProvider({
            id: providerDoc.id,
            ...providerData,
            category: categoryName,
            createdAt: providerData.createdAt ? providerData.createdAt.toDate().toISOString() : new Date(0).toISOString(),
            approvedAt: providerData.approvedAt?.toDate().toISOString(),
            featuredUntil: providerData.featuredUntil?.toDate().toISOString(),
          } as Provider);

        } catch(e: any) {
            console.error("Error fetching provider data: ", e);
            setAccountError(e.message || 'An error occurred while fetching your data.');
        }

      } else {
        // User is signed out
        router.push('/provider/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <Loading />;
  }

  if (accountError) {
      return (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertTitle>Account Not Found</AlertTitle>
            <AlertDescription className='space-y-4'>
                <p>{accountError}</p>
                 <Button onClick={() => router.push('/add-provider')}>Create a Business Listing</Button>
            </AlertDescription>
        </Alert>
      )
  }

  if (!provider) {
    return <Loading />; // Should be brief
  }

  if (provider.status === 'pending') {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock className="h-6 w-6 text-yellow-500" />Application Pending</CardTitle>
                <CardDescription>Welcome, {provider.name}!</CardDescription>
            </CardHeader>
            <CardContent>
                <Alert>
                    <AlertTitle>Your submission is under review.</AlertTitle>
                    <AlertDescription>
                        Our admin team is currently reviewing your business listing. You will be notified once it is approved. Thank you for your patience.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    );
  }
  
   if (provider.status === 'rejected' || provider.status === 'suspended') {
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Hand className="h-6 w-6 text-destructive" />Account {provider.status}</CardTitle>
                <CardDescription>Hello, {provider.name}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Alert variant="destructive">
                    <AlertTitle>There is an issue with your account.</AlertTitle>
                    <AlertDescription>
                        Your provider account has been {provider.status}. Please contact an administrator for more information and next steps.
                    </AlertDescription>
                </Alert>
                 <Button><Contact className="mr-2 h-4 w-4"/> Contact Admin</Button>
            </CardContent>
        </Card>
    );
  }
  
  const StatCard = ({ title, value, icon: Icon, description }: { title: string, value: string | number, icon: React.ElementType, description?: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold font-headline">Welcome back, {provider.name}!</h1>
                <p className="text-muted-foreground">Here's an overview of your provider profile.</p>
            </div>
             <Button>
                <Contact className="mr-2 h-4 w-4"/> Contact Admin
             </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Approval Status" value={provider.status} icon={provider.status === 'approved' ? CheckCircle : Clock} description={provider.status === 'approved' && provider.approvedAt ? `Approved on ${format(new Date(provider.approvedAt), "dd MMM yyyy")}` : 'Awaiting admin review'}/>
            <StatCard title="Featured Status" value={provider.isFeatured ? 'Active' : 'Not Active'} icon={StarIcon} description={provider.isFeatured && provider.featuredUntil ? `Expires on ${format(new Date(provider.featuredUntil), "dd MMM yyyy")}` : 'Increase your visibility'} />
            <StatCard title="Total Reviews" value={provider.reviewCount} icon={UserIcon} description="Number of customer reviews" />
            <StatCard title="Leads" value="0" icon={Hand} description="Calls & WhatsApp clicks" />
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Your Profile Information</CardTitle>
                <CardDescription>This is the information customers see. Contact an admin to update it.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center"><Building className="mr-3 h-5 w-5 text-primary" /> <strong>Service:</strong> <span className="ml-2">{provider.category}</span></div>
                <div className="flex items-center"><Info className="mr-3 h-5 w-5 text-primary" /> <strong>Location:</strong> <span className="ml-2">{provider.location.zone}, {provider.location.city}</span></div>
                <div className="flex items-center"><Contact className="mr-3 h-5 w-5 text-primary" /> <strong>Public Phone:</strong> <span className="ml-2">{provider.phone}</span></div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Your Reviews</CardTitle>
                    <CardDescription>See what your customers are saying.</CardDescription>
                </div>
                 <div className="flex items-center">
                  <StarRating rating={provider.rating} size={20} />
                  <span className="ml-3 text-sm text-muted-foreground">
                    ({provider.reviewCount} review{provider.reviewCount !== 1 ? 's' : ''})
                  </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground py-12 border-2 border-dashed rounded-lg">
                    <h2 className="text-xl font-semibold">Reviews Coming Soon</h2>
                    <p className="mt-2 text-muted-foreground">
                        Approved customer reviews will appear here.
                    </p>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
