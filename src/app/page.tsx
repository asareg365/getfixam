'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { auth } from '@/lib/firebase';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Helper for formatting phone number
const formatPhoneNumber = (phone: string) => {
  if (phone.startsWith('+233')) return phone;
  if (phone.startsWith('0')) return `+233${phone.substring(1)}`;
  return `+233${phone}`;
};

export default function ProviderLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier('recaptcha-container', {
      'size': 'invisible',
    }, auth);
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) {
        toast({ title: 'Error', description: 'Please enter a phone number.', variant: 'destructive'});
        return;
    }
    setLoading(true);
    try {
      const formattedNumber = formatPhoneNumber(phoneNumber);
      const confirmation = await signInWithPhoneNumber(auth, formattedNumber, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('otp');
      toast({ title: 'OTP Sent!', description: `An SMS has been sent to ${formattedNumber}.` });
    } catch (error: any) {
      console.error('SMS send error', error);
      toast({
        title: 'Error sending OTP',
        description: error.message || 'Please check the phone number and try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || !confirmationResult) return;
    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      toast({ title: 'Login Successful!', description: 'Redirecting to your dashboard...' });
      router.push('/provider/dashboard');
    } catch (error: any) {
      console.error('OTP verification error', error);
      toast({
        title: 'Login Failed',
        description: 'The OTP is incorrect. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30">
      <div id="recaptcha-container"></div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.12l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0-2.12l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            <span className="text-2xl font-bold font-headline">FixAm Ghana</span>
          </div>
          <div>
            <CardTitle className="text-2xl font-headline">Provider Login</CardTitle>
            <CardDescription>
                {step === 'phone'
                ? 'Enter your phone number to receive an OTP.'
                : 'Enter the OTP sent to your phone.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {step === 'phone' ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
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
                Send OTP
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={loading}
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
