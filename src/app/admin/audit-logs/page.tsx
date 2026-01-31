
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { admin } from '@/lib/firebase-admin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { requireAdmin } from '@/lib/admin-guard';

export const dynamic = 'force-dynamic';

interface AuditLog {
  id: string;
  adminEmail: string;
  action: string;
  target: string;
  timestamp: string;
}

async function getAuditLogs(): Promise<AuditLog[]> {
  const snapshot = await admin.firestore().collection('auditLogs').orderBy('timestamp', 'desc').limit(100).get();

  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map(doc => {
    const data = doc.data();
    const timestampDate = data.timestamp?.toDate();
    
    let target = `ID: ${data.targetId}`;
    if (data.targetType === 'provider') {
      target = data.details?.providerName ? `Provider: ${data.details.providerName}` : `Provider ID: ${data.targetId}`;
    } else if (data.targetType === 'review') {
      target = data.details?.providerName ? `Review for ${data.details.providerName}` : `Review ID: ${data.targetId}`;
    }

    return {
      id: doc.id,
      adminEmail: data.adminEmail ?? 'N/A',
      action: data.action ?? 'N/A',
      target: target,
      timestamp: timestampDate ? new Date(timestampDate).toLocaleString() : new Date(0).toLocaleString(),
    };
  });
}

export default async function AuditLogsPage() {
  await requireAdmin();
  const logs = await getAuditLogs();

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Admin Action Logs</CardTitle>
          <CardDescription>
            A log of all significant actions taken by administrators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Timestamp</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {logs.length > 0 ? (
                    logs.map(log => (
                        <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.adminEmail}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                log.action.includes('approve') ? 'bg-green-100 text-green-800' :
                                log.action.includes('reject') || log.action.includes('suspend') ? 'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                                {log.action}
                            </span>
                        </TableCell>
                        <TableCell>{log.target}</TableCell>
                        <TableCell>{log.timestamp}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                            No audit logs found.
                        </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
