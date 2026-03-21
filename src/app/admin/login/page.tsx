
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Wrench, Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { setAdminSessionAction } from './actions';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear session on mount to prevent "stuck" states
  useEffect(() => {
    const clearSession = async () => {
      await fetch('/api/session', { method: 'DELETE' });
    };
    clearSession();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Explicit check for API Key before attempting SDK call
    if (!auth?.app?.options?.apiKey || auth.app.options.apiKey === 'your_api_key_here') {
      setError("Firebase API Key is missing or invalid. Please configure your .env file correctly.");
      setLoading(false);
      return;
    }

    try {
      // 1. Sign in with Firebase Auth Client SDK
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Verify admin document exists and is active
      const adminDocRef = doc(db, 'admins', user.uid);
      const adminDoc = await getDoc(adminDocRef);

      if (!adminDoc.exists()) {
        throw new Error('This account does not have administrator privileges.');
      }

      const adminData = adminDoc.data();
      if (!adminData?.active) {
        throw new Error('Your administrator account is currently inactive.');
      }

      // 3. Establish secure server-side session
      const idToken = await user.getIdToken(true);
      const sessionResult = await setAdminSessionAction(idToken);

      if (!sessionResult.success) {
        throw new Error(sessionResult.error || 'Failed to establish secure session.');
      }

      toast({ title: 'Success', description: 'Redirecting to your dashboard...' });
      
      // 4. Force a hard redirect to ensure middleware sees the new cookie
      window.location.href = '/admin/dashboard';
      
    } catch (err: any) {
      console.error('Login error:', err);
      let message = 'Invalid credentials or unauthorized access.';
      
      if (err.code === 'auth/api-key-not-valid' || err.code === 'auth/invalid-api-key') {
        message = 'Firebase API Key is rejected. Please verify the keys in your Firebase Console and .env file.';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else {
        message = err.message || message;
      }
      
      setError(message);
      setLoading(false);
    }
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
            <div className="mx-auto w-fit">
                <Image src="/logo.png" alt="FixAm Logo" width={180} height={80} />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-3xl font-bold font-headline">Admin Access</CardTitle>
              <CardDescription className="text-base">
                System management portal
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="rounded-xl">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Authentication Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="rounded-xl h-12"
                  placeholder="admin@fixamghana.com"
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
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : 'Secure Sign In'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-muted/30 py-6 text-center justify-center rounded-b-3xl">
            <p className="text-xs text-muted-foreground font-medium">
              Restricted Area. Authorized personnel only.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
