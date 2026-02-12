'use client';

import { useState, useEffect, useTransition } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getProviderData } from '@/lib/provider';
import { updateProviderAvailability } from '../actions';
import type { Provider } from '@/lib/types';
import Link from 'next/link';

import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, ArrowLeft, Calendar, Save, CheckCircle2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type DailySchedule = { from: string; to: string; active: boolean };
type WeeklySchedule = { [key: string]: DailySchedule };

const DEFAULT_SCHEDULE: WeeklySchedule = DAYS.reduce((acc, day) => ({
    ...acc,
    [day]: { from: '08:00', to: '17:00', active: true }
}), {});

export default function ProviderAvailabilityPage() {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);
  const [schedule, setSchedule] = useState<WeeklySchedule>(DEFAULT_SCHEDULE);
  
  const [loading, setLoading] = useState(true);
  const [isSaving, startSavingTransition] = useTransition();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            try {
                const idToken = await currentUser.getIdToken();
                const { provider: providerData, error } = await getProviderData(idToken);
                if (error) throw new Error(error);
                if (providerData) {
                    setProvider(providerData);
                    if (providerData.availability && Object.keys(providerData.availability).length > 0) {
                        setSchedule(providerData.availability as WeeklySchedule);
                    }
                }
            } catch (e: any) {
                 toast({ title: 'Error loading schedule', description: e.message, variant: 'destructive' });
            }
        }
        setLoading(false);
    });
     return () => unsubscribe();
  }, [toast]);

  const handleToggleDay = (day: string) => {
      setSchedule(prev => ({
          ...prev,
          [day]: { ...prev[day], active: !prev[day].active }
      }));
  };

  const handleTimeChange = (day: string, type: 'from' | 'to', value: string) => {
      setSchedule(prev => ({
          ...prev,
          [day]: { ...prev[day], [type]: value }
      }));
  };

  async function handleSave() {
    if (!user) {
        toast({ title: 'Not Authenticated', description: 'Please log in again.', variant: 'destructive' });
        return;
    }

    startSavingTransition(async () => {
        try {
            const idToken = await user.getIdToken();
            const res = await updateProviderAvailability(idToken, schedule);

            if (res.success) {
                toast({ title: 'Schedule Updated', description: 'Your working hours have been saved.' });
            } else {
                throw new Error(res.error || 'An unknown error occurred.');
            }
        } catch (e: any) {
            toast({ title: 'Update Failed', description: e.message, variant: 'destructive' });
        }
    });
  }

  if (loading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-40" />
            <Card>
                <CardHeader><Skeleton className="h-24 w-full" /></CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                </CardContent>
            </Card>
        </div>
    );
  }
  
  if (!provider) {
      return (
        <Card>
            <CardHeader><CardTitle>Account Not Found</CardTitle></CardHeader>
            <CardContent><p>Please log in to manage your availability.</p></CardContent>
        </Card>
      );
  }

  return (
      <div className="space-y-8">
        <div className="flex items-center">
            <Button variant="ghost" asChild className="-ml-4 text-muted-foreground hover:text-primary">
                <Link href="/provider/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Link>
            </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
                <Card className="border-none shadow-sm rounded-3xl overflow-hidden">
                    <CardHeader className="bg-primary/5 p-8 border-b border-primary/10">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-2xl">
                                <Calendar className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <CardTitle className="text-2xl font-black font-headline">Business Hours</CardTitle>
                                <CardDescription className="text-base font-medium">Set your weekly schedule so customers know when to reach out.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                        {DAYS.map((day) => (
                            <div key={day} className={`flex flex-col md:flex-row md:items-center justify-between p-6 rounded-2xl border transition-all ${schedule[day].active ? 'bg-white shadow-sm border-primary/20' : 'bg-muted/30 border-dashed opacity-60'}`}>
                                <div className="flex items-center gap-4 mb-4 md:mb-0">
                                    <Switch 
                                        id={`toggle-${day}`} 
                                        checked={schedule[day].active} 
                                        onCheckedChange={() => handleToggleDay(day)}
                                    />
                                    <Label htmlFor={`toggle-${day}`} className="text-lg font-bold cursor-pointer w-24">{day}</Label>
                                </div>

                                {schedule[day].active ? (
                                    <div className="flex items-center gap-3">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Start</p>
                                            <input 
                                                type="time" 
                                                value={schedule[day].from} 
                                                onChange={(e) => handleTimeChange(day, 'from', e.target.value)}
                                                className="h-11 rounded-xl border border-muted-foreground/20 px-3 font-mono font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                        <span className="mt-5 text-muted-foreground font-bold">to</span>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">End</p>
                                            <input 
                                                type="time" 
                                                value={schedule[day].to} 
                                                onChange={(e) => handleTimeChange(day, 'to', e.target.value)}
                                                className="h-11 rounded-xl border border-muted-foreground/20 px-3 font-mono font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-muted-foreground italic font-medium">
                                        <Clock className="h-4 w-4" />
                                        Closed / Not working
                                    </div>
                                )}
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter className="p-8 bg-muted/5 border-t">
                        <Button onClick={handleSave} disabled={isSaving} className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl shadow-primary/20">
                            {isSaving ? <Loader2 className="mr-2 h-6 w-6 animate-spin" /> : <Save className="mr-2 h-6 w-6" />}
                            Save Weekly Schedule
                        </Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="space-y-6">
                <Card className="border-none shadow-sm rounded-3xl bg-secondary/10 overflow-hidden">
                    <div className="h-1 bg-secondary w-full" />
                    <CardHeader>
                        <CardTitle className="text-xl font-bold font-headline">Why set hours?</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4">
                            <div className="bg-white p-2.5 h-fit rounded-xl shadow-sm shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-secondary" />
                            </div>
                            <p className="text-sm font-medium leading-relaxed">Customers are more likely to book you if they know you're currently working.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white p-2.5 h-fit rounded-xl shadow-sm shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-secondary" />
                            </div>
                            <p className="text-sm font-medium leading-relaxed">Avoid getting phone calls or WhatsApp messages during your rest hours.</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="bg-white p-2.5 h-fit rounded-xl shadow-sm shrink-0">
                                <CheckCircle2 className="h-5 w-5 text-secondary" />
                            </div>
                            <p className="text-sm font-medium leading-relaxed">Shows up on your public profile as "Open Now" or "Closed".</p>
                        </div>
                    </CardContent>
                </Card>

                <div className="p-8 bg-primary/5 rounded-[32px] border-2 border-dashed border-primary/20 text-center">
                    <p className="text-primary font-bold text-sm">Need help?</p>
                    <p className="text-xs text-muted-foreground mt-1">Changes are applied immediately to your profile after saving.</p>
                </div>
            </div>
        </div>
      </div>
  );
}
