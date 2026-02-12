'use client';

import { useState, useEffect, useTransition } from 'react';
import Link from 'next/link';
import { onIdTokenChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { getProviderData } from '@/lib/provider';
import { updateProviderSettings, changeProviderPin } from '../actions';
import type { Provider, ProviderSettings } from '@/lib/types';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Settings as SettingsIcon, ShieldCheck, Key, Bell, Smartphone, Loader2, Save, Lock } from 'lucide-react';

export default function ProviderSettingsPage() {
    const { toast } = useToast();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [provider, setProvider] = useState<Provider | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Settings State
    const [settings, setSettings] = useState<ProviderSettings>({
        whatsappOnly: false,
        hideRating: false,
        notifyOnReview: true
    });

    // PIN State
    const [pinForm, setPinForm] = useState({ oldPin: '', newPin: '', confirmPin: '' });
    const [isSaving, startTransition] = useTransition();

    useEffect(() => {
        const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const idToken = await currentUser.getIdToken();
                    const { provider: providerData } = await getProviderData(idToken);
                    if (providerData) {
                        setProvider(providerData);
                        if (providerData.settings) {
                            setSettings(providerData.settings);
                        }
                    }
                } catch (e) {}
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSaveSettings = async () => {
        if (!user) return;
        startTransition(async () => {
            try {
                const idToken = await user.getIdToken();
                const res = await updateProviderSettings(idToken, settings);
                if (res.success) {
                    toast({ title: "Settings Saved", description: "Your preferences have been updated." });
                    router.refresh();
                } else {
                    throw new Error(res.error);
                }
            } catch (e: any) {
                toast({ title: "Update Failed", description: e.message, variant: "destructive" });
            }
        });
    };

    const handleChangePin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (pinForm.newPin !== pinForm.confirmPin) {
            toast({ title: "PIN Mismatch", description: "Your new PIN and confirmation do not match.", variant: "destructive" });
            return;
        }
        if (pinForm.newPin.length !== 6) {
            toast({ title: "Invalid PIN", description: "The new PIN must be exactly 6 digits.", variant: "destructive" });
            return;
        }

        startTransition(async () => {
            try {
                const idToken = await user.getIdToken();
                const res = await changeProviderPin(idToken, pinForm.oldPin, pinForm.newPin);
                if (res.success) {
                    toast({ title: "PIN Changed Successfully", description: "Use your new PIN for your next login." });
                    setPinForm({ oldPin: '', newPin: '', confirmPin: '' });
                } else {
                    throw new Error(res.error);
                }
            } catch (e: any) {
                toast({ title: "PIN Change Failed", description: e.message, variant: "destructive" });
            }
        });
    };

    if (loading) {
        return (
            <div className="space-y-8">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-[400px] w-full rounded-[32px]" />
            </div>
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

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black font-headline tracking-tight">Account Settings</h1>
                    <p className="text-muted-foreground text-lg mt-1 font-medium">Manage your security preferences and app visibility.</p>
                </div>
            </div>

            <Tabs defaultValue="privacy" className="space-y-8">
                <TabsList className="bg-muted/50 p-1 rounded-2xl border h-14">
                    <TabsTrigger value="privacy" className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Smartphone className="mr-2 h-4 w-4" /> Privacy & Reach
                    </TabsTrigger>
                    <TabsTrigger value="security" className="rounded-xl px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Lock className="mr-2 h-4 w-4" /> Security
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="privacy">
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2 space-y-6">
                            <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                                <CardHeader className="p-8 border-b bg-muted/5">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-primary/10 p-3 rounded-2xl">
                                            <Bell className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-2xl font-black font-headline">Communication</CardTitle>
                                            <CardDescription>Control how customers contact you on the platform.</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-8 space-y-8">
                                    <div className="flex items-center justify-between p-6 bg-muted/30 rounded-2xl border">
                                        <div className="space-y-1">
                                            <Label htmlFor="whatsappOnly" className="text-lg font-bold">WhatsApp Only</Label>
                                            <p className="text-sm text-muted-foreground">Hide your phone number and only allow WhatsApp chats.</p>
                                        </div>
                                        <Switch 
                                            id="whatsappOnly" 
                                            checked={settings.whatsappOnly}
                                            onCheckedChange={(checked) => setSettings(s => ({ ...settings, whatsappOnly: checked }))}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between p-6 bg-muted/30 rounded-2xl border">
                                        <div className="space-y-1">
                                            <Label htmlFor="notifyReview" className="text-lg font-bold">Review Notifications</Label>
                                            <p className="text-sm text-muted-foreground">Get notified when a customer leaves new feedback.</p>
                                        </div>
                                        <Switch 
                                            id="notifyReview" 
                                            checked={settings.notifyOnReview}
                                            onCheckedChange={(checked) => setSettings(s => ({ ...settings, notifyOnReview: checked }))}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="p-8 bg-muted/5 border-t">
                                    <Button onClick={handleSaveSettings} disabled={isSaving} className="w-full h-14 rounded-2xl text-lg font-bold">
                                        {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
                                        Save Preferences
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>

                        <div className="space-y-6">
                            <Card className="border-none shadow-sm rounded-[32px] bg-secondary/10 overflow-hidden">
                                <div className="h-1 bg-secondary w-full" />
                                <CardHeader className="p-8">
                                    <div className="bg-white p-3 rounded-2xl w-fit mb-4 shadow-sm">
                                        <ShieldCheck className="h-6 w-6 text-secondary" />
                                    </div>
                                    <CardTitle className="text-xl font-bold font-headline">Privacy Info</CardTitle>
                                    <CardDescription>Your visibility on GetFixam.</CardDescription>
                                </CardHeader>
                                <CardContent className="px-8 pb-8">
                                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                        Enabling "WhatsApp Only" is recommended if you are busy and prefer to manage requests asynchronously.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="security">
                    <div className="max-w-2xl">
                        <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                            <CardHeader className="p-8 border-b bg-muted/5">
                                <div className="flex items-center gap-4">
                                    <div className="bg-primary/10 p-3 rounded-2xl">
                                        <Key className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-2xl font-black font-headline">Security PIN</CardTitle>
                                        <CardDescription>Update the 6-digit PIN used to log in to your dashboard.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <form onSubmit={handleChangePin}>
                                <CardContent className="p-8 space-y-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="oldPin">Current 6-Digit PIN</Label>
                                        <Input 
                                            id="oldPin" 
                                            type="password" 
                                            maxLength={6} 
                                            placeholder="••••••"
                                            value={pinForm.oldPin}
                                            onChange={(e) => setPinForm(p => ({ ...p, oldPin: e.target.value }))}
                                            required
                                            className="h-14 rounded-2xl text-lg tracking-widest"
                                        />
                                    </div>
                                    <div className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="newPin">New 6-Digit PIN</Label>
                                            <Input 
                                                id="newPin" 
                                                type="password" 
                                                maxLength={6} 
                                                placeholder="••••••"
                                                value={pinForm.newPin}
                                                onChange={(e) => setPinForm(p => ({ ...p, newPin: e.target.value }))}
                                                required
                                                className="h-14 rounded-2xl text-lg tracking-widest"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPin">Confirm New PIN</Label>
                                            <Input 
                                                id="confirmPin" 
                                                type="password" 
                                                maxLength={6} 
                                                placeholder="••••••"
                                                value={pinForm.confirmPin}
                                                onChange={(e) => setPinForm(p => ({ ...p, confirmPin: e.target.value }))}
                                                required
                                                className="h-14 rounded-2xl text-lg tracking-widest"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-8 bg-muted/5 border-t">
                                    <Button type="submit" disabled={isSaving} className="w-full h-14 rounded-2xl text-lg font-bold">
                                        {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Lock className="mr-2 h-5 w-5" />}
                                        Update PIN
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
