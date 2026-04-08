import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, type TableColumn } from "@/components/ui/Table";

type TaskPreview = {
  id: string;
  title: string;
  status: "Todo" | "In Progress" | "Done";
  priority: "Low" | "Medium" | "High";
  dueDate: string;
};

const demoTasks: TaskPreview[] = [
  { id: "1", title: "Build login flow", status: "In Progress", priority: "High", dueDate: "Apr 10" },
  { id: "2", title: "Add project filters", status: "Todo", priority: "Medium", dueDate: "Apr 13" },
  { id: "3", title: "Polish dashboard cards", status: "Done", priority: "Low", dueDate: "Apr 7" },
];

const columns: Array<TableColumn<TaskPreview>> = [
  { key: "title", header: "Task" },
  {
    key: "status",
    header: "Status",
    render: (row) => <Badge variant={row.status === "Done" ? "success" : row.status === "In Progress" ? "warning" : "neutral"}>{row.status}</Badge>,
  },
  {
    key: "priority",
    header: "Priority",
    render: (row) => <Badge variant={row.priority === "High" ? "danger" : row.priority === "Medium" ? "warning" : "neutral"}>{row.priority}</Badge>,
  },
  { key: "dueDate", header: "Due" },
];

export function TaskListPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>Shadcn-style table shell for task list, filtering, and pagination.</CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <Table columns={columns} rows={demoTasks} rowKey={(row) => row.id} />
      </CardContent>
    </Card>
  );
}