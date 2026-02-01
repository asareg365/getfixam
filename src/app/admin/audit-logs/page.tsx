import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { admin } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/admin-guard';
import AuditLogsClient from './_components/audit-logs-client';

export const dynamic = 'force-dynamic';

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

async function getAuditLogs(): Promise<AuditLog[]> {
  const snapshot = await admin.firestore().collection('auditLogs').orderBy('createdAt', 'desc').limit(500).get();

  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map(doc => {
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
}

export default async function AuditLogsPage() {
  await requireAdmin();
  const logs = await getAuditLogs();

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
