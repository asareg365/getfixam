import { adminDb } from '@/lib/firebase-admin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import SecurityForm from './form';
import { ShieldAlert } from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getSecuritySettings() {
  // NOTE: We don't use requireAdmin() here because this page MUST be accessible
  // even when the system is locked, otherwise you can't unlock it.
  // Middleware will still protect this page from unauthenticated users.
  
  if (!adminDb) {
    throw new Error("Database not initialized. Check Firebase Admin setup.");
  }

  const settingsRef = adminDb.collection('system_settings').doc('admin');
  const snap = await settingsRef.get();

  if (!snap.exists) {
    return {
      isLocked: false,
      providerLoginsDisabled: false,
      reason: 'Not configured.',
      updatedBy: '',
      updatedAt: '',
    };
  }

  const data = snap.data()!;
  return {
    isLocked: data.adminLocked === true,
    providerLoginsDisabled: data.providerLoginsDisabled === true,
    reason: data.reason || '',
    updatedBy: data.updatedBy || '',
    updatedAt: data.updatedAt ? data.updatedAt.toDate().toLocaleString() : '',
  };
}

export default async function SecuritySettingsPage() {
  const { isLocked, providerLoginsDisabled, reason, updatedBy, updatedAt } = await getSecuritySettings();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-destructive" />
            <div>
                <CardTitle className="text-2xl font-headline">Security Settings</CardTitle>
                <CardDescription>
                Emergency Admin Lockout & Provider Login Control. Use with caution.
                </CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <SecurityForm 
          isLocked={isLocked} 
          providerLoginsDisabled={providerLoginsDisabled} 
          reason={reason} 
          updatedBy={updatedBy} 
          updatedAt={updatedAt} 
        />
      </CardContent>
    </Card>
  );
}
