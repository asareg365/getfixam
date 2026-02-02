'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { loginAction } from './actions';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
    </Button>
  );
}

export default function AdminLoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [state, formAction] = useActionState(loginAction, {
    success: false,
    message: '',
    errors: {},
  });

  useEffect(() => {
    if (state.success) {
      router.push('/admin/dashboard');
    }
  }, [state.success, router]);

  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        title: 'Login Failed',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-4">
            <Link href="/" className="flex justify-center items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-primary"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2.12l-.15.1a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l-.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1 0 2.12l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                <span className="text-2xl font-bold font-headline">FixAm Ghana</span>
            </Link>
            <div>
                <CardTitle className="text-2xl font-headline">Admin Login</CardTitle>
                <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
            </div>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
              />
              {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
              />
               {state.errors?.password && <p className="text-sm text-destructive">{state.errors.password[0]}</p>}
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
