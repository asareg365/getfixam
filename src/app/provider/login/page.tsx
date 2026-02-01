
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { checkProviderForPinLogin } from '../actions';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';


export default function ProviderLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'pin'>('phone');

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
        toast({ title: 'Error', description: 'Please enter a phone number.', variant: 'destructive'});
        return;
    }
    setLoading(true);

    const { canLogin, message } = await checkProviderForPinLogin(phoneNumber);

    if (canLogin) {
        setStep('pin');
        toast({ title: 'Account Found!', description: `Please enter your one-time PIN.` });
    } else {
        toast({
            title: 'Login Unavailable',
            description: message || "An unknown error occurred.",
            variant: "destructive"
        });
    }
    
    setLoading(false);
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin) {
        toast({ title: 'Error', description: 'Please enter your PIN.', variant: 'destructive'});
        return;
    }
    setLoading(true);

    try {
      const res = await fetch('/api/provider/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, pin }),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.message || 'PIN verification failed.');
      }
      
      // Sign in with the custom token from the server
      await signInWithCustomToken(auth, result.token);
      
      toast({ title: 'Login Successful!', description: 'Redirecting to your dashboard...' });
      router.push('/provider/dashboard');

    } catch (error: any) {
      console.error('PIN login error', error);
      toast({
        title: 'Login Failed',
        description: error.message || 'The PIN may be incorrect. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-4">
          <Link href="/" className="flex justify-center items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.12l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0 2.12l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span className="text-2xl font-bold font-headline">FixAm Ghana</span>
          </Link>
          <div>
            <CardTitle className="text-2xl font-headline">Provider Login</CardTitle>
            <CardDescription>
                {step === 'phone'
                ? 'Enter your registered phone number.'
                : 'Enter the one-time PIN provided by the admin.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0241234567"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">One-Time PIN</Label>
                <Input
                  id="pin"
                  type="text"
                  inputMode='numeric'
                  placeholder="_ _ _ _ _ _"
                  required
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  disabled={loading}
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Login
              </Button>
               <Button variant="link" size="sm" onClick={() => setStep('phone')} className="w-full">
                Use a different phone number
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
        <footer className="absolute bottom-0 p-4 w-full">
            <div className="text-center text-sm">
                <Link href="/admin/login" className="text-muted-foreground hover:text-primary transition-colors">
                Admin Login
                </Link>
            </div>
        </footer>
    </div>
  );
}
