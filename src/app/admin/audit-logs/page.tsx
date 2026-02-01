import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { admin } from '@/lib/firebase-admin';
import { requireAdmin } from '@/lib/admin-guard';
import AuditLogsClient from './_components/audit-logs-client';
import { startOfDay, endOfDay } from 'date-fns';

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

// Helper to get unique values for filter dropdowns
async function getUniqueLogFields() {
    const snapshot = await admin.firestore().collection('auditLogs').select('action', 'targetType').get();
    const actions = new Set<string>();
    const targetTypes = new Set<string>();
    snapshot.forEach(doc => {
        const data = doc.data();
        if (data.action) actions.add(data.action);
        if (data.targetType) targetTypes.add(data.targetType);
    });
    return {
        uniqueActions: Array.from(actions).sort(),
        uniqueTargetTypes: Array.from(targetTypes).sort(),
    };
}


export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  await requireAdmin();

  const { action, targetType, search, from, to } = searchParams;
  
  let query: admin.firestore.Query = admin.firestore().collection('auditLogs');

  if (action) {
    query = query.where('action', '==', action);
  }
  if (targetType) {
    query = query.where('targetType', '==', targetType);
  }
  if (from) {
    query = query.where('createdAt', '>=', startOfDay(new Date(from)));
  }
   if (to) {
    query = query.where('createdAt', '<=', endOfDay(new Date(to)));
  }
  
  // Always order by date
  query = query.orderBy('createdAt', 'desc').limit(500);

  const snapshot = await query.get();

  let logs: AuditLog[] = snapshot.docs.map(doc => {
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

  // Perform search filter in memory, as Firestore doesn't support partial text search
  if (search) {
      const lowercasedSearch = search.toLowerCase();
      logs = logs.filter(log => 
        log.adminEmail.toLowerCase().includes(lowercasedSearch) ||
        log.targetId.toLowerCase().includes(lowercasedSearch)
      );
  }

  const { uniqueActions, uniqueTargetTypes } = await getUniqueLogFields();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-headline">Admin Action Logs</CardTitle>
        <CardDescription>
          A log of all significant actions taken by administrators.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuditLogsClient logs={logs} uniqueActions={uniqueActions} uniqueTargetTypes={uniqueTargetTypes} />
      </CardContent>
    </Card>
  );
}
