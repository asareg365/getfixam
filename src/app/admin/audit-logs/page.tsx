import { requireAdmin } from '@/lib/admin-guard';
import { adminDb } from '@/lib/firebase-admin';
import AuditLogsClient from './_components/audit-logs-client';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{ [key: string]: string | undefined }>;
};

async function getAuditLogs(filters: { action?: string; targetType?: string; from?: string; to?: string; search?: string }) {
  const db = adminDb;
  if (!db || typeof db.collection !== 'function') return { logs: [], actions: [], targets: [] };

  try {
    let query = db.collection('auditLogs').orderBy('createdAt', 'desc');

    if (filters.action) query = query.where('action', '==', filters.action) as any;
    if (filters.targetType) query = query.where('targetType', '==', filters.targetType) as any;

    const snap = await query.limit(500).get();
    let logs = snap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        adminEmail: data.adminEmail,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        createdAt: data.createdAt?.toDate()?.toLocaleString() || '—',
      };
    });

    if (filters.search) {
      const s = filters.search.toLowerCase();
      logs = logs.filter(log => 
        log.adminEmail.toLowerCase().includes(s) || 
        log.action.toLowerCase().includes(s) || 
        log.targetId.toLowerCase().includes(s)
      );
    }

    const uniqueActions = Array.from(new Set(logs.map(l => l.action)));
    const uniqueTargets = Array.from(new Set(logs.map(l => l.targetType)));

    return { logs, actions: uniqueActions, targets: uniqueTargets };
  } catch (e) {
    console.error("Audit log fetch error:", e);
    return { logs: [], actions: [], targets: [] };
  }
}

export default async function AuditLogsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  await requireAdmin();

  const filters = {
    action: searchParams.action,
    targetType: searchParams.targetType,
    from: searchParams.from,
    to: searchParams.to,
    search: searchParams.search,
  };

  const { logs, actions, targets } = await getAuditLogs(filters);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Audit Logs</h1>
        <p className="text-muted-foreground">Track all administrative actions performed in the system.</p>
      </div>

      <AuditLogsClient logs={logs} uniqueActions={actions} uniqueTargetTypes={targets} />
    </div>
  );
}
