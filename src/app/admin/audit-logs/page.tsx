import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { admin } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/admin-guard';
import AuditLogsClient from './_components/audit-logs-client';

export const dynamic = 'force-dynamic';

// This interface must match the one in the client component
interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

export default async function AuditLogsPage() {
  await requireAdmin();
  
  const snapshot = await admin.firestore().collection('auditLogs').orderBy('createdAt', 'desc').limit(500).get();

  const logs: AuditLog[] = snapshot.docs.map(doc => {
    const data = doc.data();
    const createdAtDate = data.createdAt?.toDate();
    
    return {
      id: doc.id,
      adminEmail: data.adminEmail ?? 'N/A',
      action: data.action ?? 'N/A',
      targetType: data.targetType ?? 'N/A',
      targetId: data.targetId ?? 'N/A',
      ipAddress: data.ipAddress ?? 'N/A',
      userAgent: data.userAgent ?? 'N/A',
      createdAt: createdAtDate ? new Date(createdAtDate).toLocaleString() : 'N/A',
    };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Admin Action Logs</CardTitle>
        <CardDescription>
          A log of all significant actions taken by administrators.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuditLogsClient logs={logs} />
      </CardContent>
    </Card>
  );
}
