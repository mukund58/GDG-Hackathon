import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

export default async function TaskDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-2xl">Task #{id}</CardTitle>
            <Badge variant="warning">In Progress</Badge>
          </div>
          <CardDescription>
            Task details page shell with sections for info, checklist, comments, and activity.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
          </CardHeader>
          <CardContent className="pb-6 text-sm text-muted-foreground">
            Add checklist CRUD and progress UI here.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
          </CardHeader>
          <CardContent className="pb-6 text-sm text-muted-foreground">
            Add comment list and composer UI here.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}