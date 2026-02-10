'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, ShieldCheck, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const q = query(collection(db, 'auditLogs'), orderBy('createdAt', 'desc'), limit(100));
        const snap = await getDocs(q);
        const logsData = snap.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate()?.toLocaleString() || '—',
          };
        });
        setLogs(logsData);
      } catch (err) {
        console.error("Error fetching audit logs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  const getActionVariant = (action: string) => {
    if (action.includes('SUCCESS') || action.includes('APPROVE')) return 'success';
    if (action.includes('FAILED') || action.includes('REJECT') || action.includes('LOCKED')) return 'destructive';
    return 'secondary';
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tight text-foreground">Audit Logs</h1>
          <p className="text-muted-foreground text-lg mt-1 font-medium">Tracking all administrative actions for system transparency.</p>
        </div>
        <div className="flex gap-2">
            <div className="bg-white border rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold text-primary">Tamper-proof storage</span>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border shadow-sm overflow-hidden">
        <div className="p-6 border-b bg-muted/5 flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input className="w-full h-11 pl-10 pr-4 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" placeholder="Search by email or action..." />
            </div>
            <button className="h-11 px-4 border rounded-xl flex items-center text-sm font-bold hover:bg-muted/50 transition-colors">
                <Filter className="mr-2 h-4 w-4" />
                Filter Logs
            </button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/5 border-none">
                <TableHead className="font-bold py-6 px-6">Administrator</TableHead>
                <TableHead className="font-bold">Action</TableHead>
                <TableHead className="font-bold">Target</TableHead>
                <TableHead className="font-bold">Timestamp</TableHead>
                <TableHead className="font-bold text-right px-6">Trace ID</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/5 transition-colors border-muted/10">
                  <TableCell className="py-5 px-6">
                    <div className="font-bold text-primary">{log.adminEmail}</div>
                    <div className="text-[10px] text-muted-foreground font-mono">{log.ipAddress}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionVariant(log.action)} className="rounded-md uppercase text-[10px] font-black tracking-wider">
                        {log.action.replace(/_/g, ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-bold uppercase text-muted-foreground/70">{log.targetType}</div>
                    <div className="text-[10px] font-mono">{log.targetId}</div>
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {log.createdAt}
                  </TableCell>
                  <TableCell className="text-right px-6 font-mono text-[10px] text-muted-foreground">
                    {log.id.slice(0, 12)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {logs.length === 0 && (
            <div className="py-24 text-center">
                <p className="text-muted-foreground font-medium">No administrative logs recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
