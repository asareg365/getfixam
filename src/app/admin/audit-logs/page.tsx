'use server';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { adminDb } from '@/lib/firebase-admin';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AuditLog {
  id: string;
  adminEmail: string;
  providerName: string;
  providerId: string;
  action: string;
  timestamp: string;
}

async function getAuditLogs(): Promise<AuditLog[]> {
  const snapshot = await adminDb.collection('auditLogs').orderBy('timestamp', 'desc').limit(100).get();

  if (snapshot.empty) {
    return [];
  }

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      adminEmail: data.adminEmail ?? 'N/A',
      providerName: data.providerName ?? 'N/A',
      providerId: data.providerId ?? 'N/A',
      action: data.action ?? 'N/A',
      timestamp: data.timestamp ? new Date(data.timestamp.toDate()).toLocaleString() : new Date(0).toLocaleString(),
    };
  });
}

export default async function AuditLogsPage() {
  const logs = await getAuditLogs();

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Provider Action Logs</CardTitle>
          <CardDescription>
            A log of all provider approval and rejection actions taken by administrators.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead>Admin</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Timestamp</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {logs.length > 0 ? (
                    logs.map(log => (
                        <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.adminEmail}</TableCell>
                        <TableCell>{log.providerName}</TableCell>
                        <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${log.action === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {log.action}
                            </span>
                        </TableCell>
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
