'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Wrench, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Scaffolding: Simulating login success
    setTimeout(() => {
      router.push('/admin');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 relative overflow-hidden">
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
                Enter your credentials to manage the FixAm platform.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Work Email</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  className="rounded-xl h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@fixam.com"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="#" className="text-xs text-primary hover:underline">Forgot?</Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  className="rounded-xl h-12"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-bold text-base shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                Sign In to Panel
              </Button>
            </form>
          </CardContent>
          <CardFooter className="bg-muted/30 py-6 text-center justify-center rounded-b-3xl">
            <p className="text-xs text-muted-foreground">
              Internal system access only. All activity is logged and monitored.
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}