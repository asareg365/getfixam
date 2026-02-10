'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SecurityForm from './form';
import { ShieldAlert, Loader2 } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const docRef = doc(db, 'system_settings', 'admin');
        
        const snap = await getDoc(docRef).catch(async (err) => {
            if (err.code === 'permission-denied' || err.message?.includes('permissions')) {
                const permissionError = new FirestorePermissionError({
                    path: docRef.path,
                    operation: 'get',
                } satisfies SecurityRuleContext);
                errorEmitter.emit('permission-error', permissionError);
                return null;
            }
            throw err;
        });
        
        if (snap && snap.exists()) {
          const data = snap.data();
          setSettings({
            isLocked: data.adminLocked === true,
            providerLoginsDisabled: data.providerLoginsDisabled === true,
            reason: data.reason || '',
            updatedBy: data.updatedBy || '',
            updatedAt: data.updatedAt ? data.updatedAt.toDate().toLocaleString() : '',
          });
        } else if (snap) {
          // Document doesn't exist yet, provide defaults
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

  // Handle case where settings couldn't be loaded (e.g. permission denied)
  if (!settings) {
      return (
        <Card className="max-w-2xl mx-auto border-none shadow-2xl rounded-[40px] overflow-hidden">
            <div className="h-2 bg-destructive w-full" />
            <CardContent className="p-10 text-center">
                <div className="bg-destructive/10 p-4 rounded-full w-fit mx-auto mb-4">
                    <ShieldAlert className="h-8 w-8 text-destructive" />
                </div>
                <h3 className="text-xl font-bold">Access Restricted</h3>
                <p className="text-muted-foreground mt-2">You do not have permission to view or manage system security settings.</p>
            </CardContent>
        </Card>
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
