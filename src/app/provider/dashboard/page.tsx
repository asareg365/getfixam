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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // User is signed in, let's find their provider document.
        try {
          // 1. First, try to find by UID
          let providerQuery = query(collection(db, 'providers'), where('authUid', '==', currentUser.uid));
          let providerSnap = await getDocs(providerQuery);
          let providerDoc;

          if (providerSnap.empty) {
            // 2. If not found, try to find by phone number (and ensure it's approved)
            if (!currentUser.phoneNumber) {
                throw new Error("Phone number not found on authenticated user. Cannot link account.");
            }
            // In Ghana, numbers start with 0, but Firebase stores them as +233...
            // We need to match the format in the DB, which is `0...`
            const localPhoneNumber = currentUser.phoneNumber.substring(4); 
            providerQuery = query(
              collection(db, 'providers'),
              where('phone', '==', `0${localPhoneNumber}`),
              where('status', '==', 'approved')
            );
            providerSnap = await getDocs(providerQuery);

            if (!providerSnap.empty) {
              // 3. Found by phone! Link the UID for future logins.
              providerDoc = providerSnap.docs[0];
              await updateDoc(doc(db, 'providers', providerDoc.id), { authUid: currentUser.uid });
            } else {
                throw new Error("Your account is not registered or has not been approved by an admin yet. Please contact support if you believe this is an error.");
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
            createdAt: providerData.createdAt.toDate().toISOString(),
            approvedAt: providerData.approvedAt?.toDate().toISOString(),
            featuredUntil: providerData.featuredUntil?.toDate().toISOString(),
          } as Provider);

        } catch(e: any) {
            console.error("Error fetching provider data: ", e);
            setError(e.message || 'An error occurred while fetching your data.');
            // Sign out the user if they can't be linked to a provider profile
            await auth.signOut();
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

  if (error) {
      return (
        <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
                {error} <br /><br />
                 <Button onClick={() => router.push('/provider/login')}>Go to Login</Button>
            </AlertDescription>
        </Alert>
      )
  }

  if (!provider) {
    return <Loading />; // Or a "not found" state
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
