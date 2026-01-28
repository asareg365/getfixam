'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
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
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible',
    });
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
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Provider Login</CardTitle>
          <CardDescription>
            {step === 'phone'
              ? 'Enter your phone number to receive an OTP.'
              : 'Enter the OTP sent to your phone.'}
          </CardDescription>
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
    </div>
  );
}
