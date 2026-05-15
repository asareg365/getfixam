import { DisputeReviewPanel } from '@/components/admin/DisputeReviewPanel';
import { EscrowMonitorTable } from '@/components/admin/EscrowMonitorTable';
import { PayoutApprovalPanel } from '@/components/admin/PayoutApprovalPanel';
import { RevenueGraph } from '@/components/admin/RevenueGraph';
import { SummaryCards } from '@/components/admin/SummaryCards';
import DynamicProviderMap from "@/components/admin/DynamicProviderMap";

type PageProps = {
  searchParams: Promise<{ city?: string }>
}

export default async function AdminDashboard({ searchParams }: PageProps) {
  const { city } = await searchParams;
  const locationName = city ? city.charAt(0).toUpperCase() + city.slice(1) : 'Global';

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black font-headline tracking-tight text-foreground">
            Financial Dashboard {city && <span className="text-primary">({locationName})</span>}
          </h1>
          <p className="text-muted-foreground text-lg mt-1 font-medium">Monitoring platform liquidity, escrow security, and revenue streams.</p>
        </div>
      </div>
      
      <div className="space-y-6">
        <h2 className="text-xl font-bold font-headline flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            Live Network Traffic
        </h2>
        <DynamicProviderMap />
      </div>
      
      <SummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RevenueGraph />
        <EscrowMonitorTable />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <PayoutApprovalPanel />
        <DisputeReviewPanel />
      </div>
    </div>
  );
}
