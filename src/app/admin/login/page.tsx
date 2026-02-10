'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, limit, query, serverTimestamp } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { setAdminSessionAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const adminDocRef = doc(db, 'admins', user.uid);
      const adminDoc = await getDoc(adminDocRef);

      let role = 'admin';

      if (!adminDoc.exists()) {
        const adminsSnap = await getDocs(query(collection(db, 'admins'), limit(1)));
        
        if (adminsSnap.empty) {
          role = 'super_admin';
          const newAdminData = {
            email: user.email,
            role: role,
            active: true,
            createdAt: serverTimestamp(),
          };

          // CRITICAL: Non-blocking mutation with contextual error emission
          setDoc(adminDocRef, newAdminData)
            .then(async () => {
                toast({ title: 'System Initialized', description: 'You have been granted Super Admin access.' });
                await finalizeSession(user.uid, user.email!, role);
            })
            .catch(async (serverError) => {
                const permissionError = new FirestorePermissionError({
                    path: adminDocRef.path,
                    operation: 'create',
                    requestResourceData: newAdminData,
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
                setLoading(false);
            });
          
          return; // Stop here, finalized in the .then()
        } else {
          throw new Error('Authenticated but not authorized as an administrator.');
        }
      } else {
        const adminData = adminDoc.data();
        if (!adminData?.active) {
          throw new Error('Administrator account is inactive.');
        }
        role = adminData.role;
      }

      await finalizeSession(user.uid, user.email!, role);
      
    } catch (err: any) {
      setError(err.message || 'Invalid credentials or unauthorized access.');
      setLoading(false);
    }
  }

  async function finalizeSession(uid: string, email: string, role: string) {
    const sessionResult = await setAdminSessionAction(uid, email, role);
    if (!sessionResult.success) {
        throw new Error(sessionResult.error || 'Failed to establish session.');
    }
    toast({ title: 'Success', description: 'Redirecting to dashboard...' });
    window.location.href = '/admin';
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden font-body">
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="w-full max-w-md relative z-10">
        <div className="mb-6">
          <Button variant="ghost" asChild size="sm" className="rounded-full">
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Website
            </Link>
          </Button>
        </div>

        <Card className="border-none shadow-2xl rounded-3xl">
          <CardHeader className="text-center space-y-4 pt-10">
            <div className="mx-auto bg-primary/10 p-4 rounded-3xl w-fit">
              <Wrench className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold font-headline">Admin Access</CardTitle>
              <CardDescription className="text-base">
                Manage the FixAm platform.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Login Failed</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl h-12"
                  placeholder="admin@fixam.com"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl h-12"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-muted/30 py-6 text-center justify-center rounded-b-3xl">
            <p className="text-xs text-muted-foreground font-medium">
              Internal system access only. Activity is monitored.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
