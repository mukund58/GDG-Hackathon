import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { getDashboardStatsSSR } from "@/services/dashboard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const stats = await getDashboardStatsSSR();

  return <DashboardOverview stats={stats} />;
}