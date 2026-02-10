'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SecurityForm from './form';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, 'system_settings', 'admin');
        const snap = await getDoc(docRef);
        
        if (snap.exists()) {
          const data = snap.data();
          setSettings({
            isLocked: data.adminLocked === true,
            providerLoginsDisabled: data.providerLoginsDisabled === true,
            reason: data.reason || '',
            updatedBy: data.updatedBy || '',
            updatedAt: data.updatedAt ? data.updatedAt.toDate().toLocaleString() : '',
          });
        } else {
          setSettings({
            isLocked: false,
            providerLoginsDisabled: false,
            reason: 'Not configured.',
            updatedBy: 'system',
            updatedAt: 'initial setup',
          });
        }
      } catch (err) {
        console.error("Error fetching security settings:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto border-none shadow-2xl rounded-[40px] overflow-hidden">
      <div className="h-2 bg-destructive w-full" />
      <CardHeader className="p-10">
        <div className="flex items-center gap-4">
            <div className="bg-destructive/10 p-3 rounded-2xl">
                <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <div>
                <CardTitle className="text-3xl font-black font-headline tracking-tight">Security Center</CardTitle>
                <CardDescription className="text-lg">
                Emergency Admin Lockout & Provider Login Control.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent className="p-10 pt-0">
        <SecurityForm 
          isLocked={settings.isLocked} 
          providerLoginsDisabled={settings.providerLoginsDisabled} 
          reason={settings.reason} 
          updatedBy={settings.updatedBy} 
          updatedAt={settings.updatedAt} 
        />
      </CardContent>
    </Card>
  );
}
