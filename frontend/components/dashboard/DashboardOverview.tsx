import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import type { DashboardStats } from "@/types/dashboard";

type Props = {
  stats: DashboardStats | null;
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export function DashboardOverview({ stats }: Props) {
  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard SSR preview</CardTitle>
          <CardDescription>
            Dashboard page is server-rendered. Data is unavailable without an authenticated Admin/Manager
            request.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-3xl font-semibold tracking-tight">Dashboard</h2>
        <Badge variant="success">SSR</Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total tasks" value={stats.totalTasks} />
        <StatCard label="Completed tasks" value={stats.completedTasks} />
        <StatCard label="Active tasks" value={stats.activeTasks} />
        <StatCard label="Overdue tasks" value={stats.overdueTasks} />
        <StatCard label="Total users" value={stats.totalUsers} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workload distribution</CardTitle>
          <CardDescription>Top/least loaded users from backend aggregate stats.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pb-6 text-sm text-muted-foreground">
          <p>
            Most loaded: <span className="font-medium text-foreground">{stats.workloadDistribution.mostLoadedUser.userName || "-"}</span>
          </p>
          <p>
            Least loaded: <span className="font-medium text-foreground">{stats.workloadDistribution.leastLoadedUser.userName || "-"}</span>
          </p>
          <p>
            Average tasks per user: <span className="font-medium text-foreground">{stats.workloadDistribution.averageTasksPerUser.toFixed(1)}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}