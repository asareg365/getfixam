'use client';

import { useState } from 'react';
import { loginWithPin } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ProviderLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await loginWithPin(phone, pin);

    if (res.error) {
      toast({ title: 'Login failed', description: res.error, variant: 'destructive' });
      setLoading(false);
      return;
    }

    toast({ title: 'Welcome back!', description: 'Redirecting to dashboard…' });
    router.push('/provider/dashboard');
    router.refresh();
  }

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
                <CardDescription>Login using your phone number and PIN.</CardDescription>
            </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0241234567"
                required
              />
            </div>

            <div>
              <Label htmlFor="pin">6-Digit PIN</Label>
              <Input
                id="pin"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                type="password"
                placeholder="••••••"
                maxLength={6}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Forgot PIN? Contact FixAm Admin for a reset.
            </p>
          </form>
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
