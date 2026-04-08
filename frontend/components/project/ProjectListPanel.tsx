import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";

const demoProjects = [
  { id: "onboarding", name: "Onboarding Revamp", description: "Improve first-week setup flow." },
  { id: "core-api", name: "Core API Hardening", description: "RBAC, ownership, and validations." },
  { id: "ui-refresh", name: "Frontend Productization", description: "Move from CRUD UI to product UX." },
];

export function ProjectListPanel() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">Projects</h2>
        <Button size="sm">Create Project</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {demoProjects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href="/tasks">View related tasks</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}