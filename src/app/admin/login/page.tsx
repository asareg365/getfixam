'use client';

import { useState } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { Wrench, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/20 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <Wrench className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Admin Access</h1>
          <p className="text-muted-foreground text-sm">Enter your credentials to manage FixAm.</p>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md mb-6 border border-destructive/20">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fixam.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary text-white rounded-md font-medium hover:bg-primary/90 transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Back to Website
          </Link>
        </div>
      </div>
    </div>
  );
}