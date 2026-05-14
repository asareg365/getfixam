'use client';

import { useState, Suspense } from 'react';
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
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/firebase';
import { signInWithCustomToken } from 'firebase/auth';
import Image from 'next/image';

function ProviderLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const city = searchParams.get('city') || 'berekum';
  const backPath = `/${city}`;

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Verify PIN and get a custom token
      const response = await fetch('/api/provider/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, pin }),
      });

      const res = await response.json();

      if (!response.ok) {
        toast({
          title: 'Login Failed',
          description: res.error || 'Invalid phone or PIN.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // 2. Sign in on the client
      const userCredential = await signInWithCustomToken(auth, res.token);

      // Force token refresh to ensure custom claims (role) are included
      await userCredential.user.getIdToken(true);
      const idToken = await userCredential.user.getIdToken();

      // 3. Establish secure session
      const sessionRes = await fetch('/api/provider/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!sessionRes.ok) {
        throw new Error('Failed to establish a secure session cookie.');
      }

      toast({
        title: 'Sign-in Successful',
        description: 'Welcome back! Loading your dashboard...',
      });

      // 4. Hard redirect to dashboard
      window.location.href = '/provider/dashboard';
      
    } catch (error: any) {
      console.error('Login flow error:', error);
      toast({
        title: 'Authentication Error',
        description: error.message || 'An error occurred during sign-in.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-sm">
      <div className="w-full mb-6">
        <Button
          variant="ghost"
          asChild
          size="sm"
          className="rounded-full text-muted-foreground hover:text-primary"
        >
          <Link href={backPath}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Website
          </Link>
        </Button>
      </div>

      <Card className="w-full shadow-2xl border-none rounded-3xl overflow-hidden">
        <div className="h-2 bg-primary w-full" />
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="mx-auto w-fit">
            <Image
              src="/logo.png"
              alt="GetFixam Logo"
              width={180}
              height={80}
            />
          </div>
          <div>
            <CardTitle className="text-3xl font-bold font-headline text-primary tracking-tight">
              Artisan Access
            </CardTitle>
            <CardDescription className="text-base font-medium">
              Log in to manage your bookings and profile.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-10">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="phone" className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. 024 123 4567"
                required
                disabled={loading}
                className="h-12 rounded-xl border-muted-foreground/20 text-lg font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pin" className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
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
                disabled={loading}
                className="h-12 rounded-xl border-muted-foreground/20 text-2xl tracking-[0.5em] text-center"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 transition-transform active:scale-95"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                'Secure Sign In'
              )}
            </Button>

            <div className="text-center space-y-4 pt-4">
              <p className="text-sm text-muted-foreground font-medium">
                Forgot PIN? Contact support for a reset.
              </p>
              <div className="h-px bg-muted w-full" />
              <p className="text-sm font-medium">
                New to the platform?{' '}
                <Link
                  href={`${backPath}/add-provider`}
                  className="text-primary font-black hover:underline"
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

export default function ProviderLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/30 p-4">
      <Suspense fallback={<Loader2 className="h-10 w-10 animate-spin text-primary" />}>
        <ProviderLoginForm />
      </Suspense>
    </div>
  );
}
