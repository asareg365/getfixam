'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import Image from 'next/image';

export default function ProviderLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verify PIN on the server and get a custom Firebase token
      const response = await fetch('/api/provider/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin }),
      });

      const res = await response.json();

      if (!response.ok) {
        toast({
          title: 'Login failed',
          description: res.message,
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // 2. Sign in to Firebase Auth on the client using the custom token
      const userCredential = await signInWithCustomToken(auth, res.token);

      // REQUIRED so claims are included
      await userCredential.user.getIdToken(true);

      // 3. Get the ID token from the signed-in user
      const idToken = await userCredential.user.getIdToken();

      if (!idToken) {
        throw new Error('Could not get ID token.');
      }

      // 4. Send the ID token to our session API to create a secure server-side cookie
      const sessionRes = await fetch('/api/provider/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!sessionRes.ok) {
        throw new Error('Failed to establish a secure session.');
      }

      toast({
        title: 'Welcome back!',
        description: 'Redirecting to your dashboard...',
      });

      // 5. Successful login, redirect to the provider dashboard
      router.push('/provider/dashboard');
      router.refresh();
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: 'Authentication Error',
        description: error.message || 'An error occurred during sign-in.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
      <div className="w-full max-w-sm mb-6">
        <Button
          variant="ghost"
          asChild
          size="sm"
          className="rounded-full text-muted-foreground hover:text-primary"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Website
          </Link>
        </Button>
      </div>

      <Card className="w-full max-w-sm shadow-2xl border-none rounded-3xl">
        <CardHeader className="text-center space-y-4">
          <Link href="/" className="flex justify-center items-center">
            <Image
              src="/logo.png"
              alt="GetFixam Logo"
              width={250}
              height={100}
            />
          </Link>
          <div>
            <CardTitle className="text-2xl font-bold font-headline">
              Artisan Login
            </CardTitle>
            <CardDescription>
              Enter your phone number and 6-digit PIN.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-semibold">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0241234567"
                required
                className="h-12 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin" className="font-semibold">
                6-Digit PIN
              </Label>
              <Input
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                type="password"
                placeholder="••••••"
                maxLength={6}
                required
                className="h-12 rounded-xl"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 rounded-xl font-bold text-lg shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Forgot PIN? Contact GetFixam Admin for a reset.
              </p>
              <p className="text-xs">
                Don't have an account?{' '}
                <Link
                  href="/add-provider"
                  className="text-primary font-bold hover:underline"
                >
                  List your business
                </Link>
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
