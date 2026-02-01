
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
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

async function getAuditLogs(): Promise<AuditLog[]> {
  const snapshot = await admin.firestore().collection('auditLogs').orderBy('createdAt', 'desc').limit(100).get();

  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map(doc => {
    const data = doc.data();
    const createdAtDate = data.createdAt?.toDate();
    
    const target = `${data.targetType}: ${data.targetId}`;

    return {
      id: doc.id,
      adminEmail: data.adminEmail ?? 'N/A',
      action: data.action ?? 'N/A',
      target: target,
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
                    <TableHead>IP Address</TableHead>
                    <TableHead className="w-[300px]">User Agent</TableHead>
                    <TableHead>Date</TableHead>
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
                        <TableCell className="font-mono text-xs">{log.target}</TableCell>
                        <TableCell className="font-mono text-xs">{log.ipAddress}</TableCell>
                        <TableCell className="text-xs text-muted-foreground truncate">{log.userAgent}</TableCell>
                        <TableCell>{log.createdAt}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
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

    