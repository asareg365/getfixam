import { DisputeReviewPanel } from '@/components/admin/DisputeReviewPanel';
import { EscrowMonitorTable } from '@/components/admin/EscrowMonitorTable';
import { PayoutApprovalPanel } from '@/components/admin/PayoutApprovalPanel';
import { RevenueGraph } from '@/components/admin/RevenueGraph';
import { SummaryCards } from '@/components/admin/SummaryCards';
import DynamicProviderMap from "@/components/admin/DynamicProviderMap";

export default function AdminDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Financial Dashboard</h1>
      
      <h2 className="text-xl font-bold mb-4">Live Provider Map</h2>
      <DynamicProviderMap />
      
      <SummaryCards />

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-4">
        <RevenueGraph />
        <EscrowMonitorTable />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PayoutApprovalPanel />
        <DisputeReviewPanel />
      </div>

    </div>
  );
}
