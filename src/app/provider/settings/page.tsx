'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';

export default function ProviderSettingsPage() {
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
                    <p className="text-muted-foreground text-lg mt-1 font-medium">Manage your security preferences and app settings.</p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <Card className="border-none shadow-sm rounded-[32px] overflow-hidden">
                        <CardHeader className="p-8 border-b bg-muted/5">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-2xl">
                                    <SettingsIcon className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black font-headline">Security & Access</CardTitle>
                                    <CardDescription>Update your login credentials and security settings.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="py-12 text-center border-2 border-dashed rounded-[24px] bg-muted/10">
                                <p className="text-muted-foreground font-medium italic">Setting up secure PIN management. Coming soon.</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="border-none shadow-sm rounded-[32px] bg-secondary/10 overflow-hidden">
                        <div className="h-1 bg-secondary w-full" />
                        <CardHeader className="p-8">
                            <div className="bg-white p-3 rounded-2xl w-fit mb-4 shadow-sm">
                                <ShieldCheck className="h-6 w-6 text-secondary" />
                            </div>
                            <CardTitle className="text-xl font-bold font-headline">Privacy & Safety</CardTitle>
                            <CardDescription>Your security is our top priority at GetFixam.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-8">
                            <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                                We use industry-standard encryption to protect your account. Your phone number is only shared with verified customers who want to book your services.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
