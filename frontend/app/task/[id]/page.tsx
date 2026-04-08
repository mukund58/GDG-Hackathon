"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { ApiError } from "@/services/api";
import {
  addTaskChecklistItem,
  addTaskComment,
  assignTask,
  getTaskActivity,
  getTaskById,
  getTaskChecklist,
  getTaskChecklistSummary,
  getTaskComments,
  getTasks,
  toggleTaskChecklistItem,
  updateTask,
  updateTaskStatus,
} from "@/services/task";
import { getUsers } from "@/services/user";
import type { TaskPriority, UpdateTaskInput } from "@/types/task";

type Suggestion = {
  userId: string;
  userName: string;
  priority: TaskPriority;
  explanation: string;
};

function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function computeSuggestedPriority(dueDate?: string | null): TaskPriority {
  if (!dueDate) {
    return "Medium";
  }

  const dueTime = new Date(dueDate).getTime();
  if (Number.isNaN(dueTime)) {
    return "Medium";
  }

  const daysRemaining = (dueTime - Date.now()) / (24 * 60 * 60 * 1000);

  if (daysRemaining <= 2) {
    return "High";
  }

  if (daysRemaining <= 6) {
    return "Medium";
  }

  return "Low";
}

export default function TaskDetailsPage() {
  const params = useParams<{ id: string }>();
  const taskId = String(params.id ?? "");
  const queryClient = useQueryClient();

  const [titleDraft, setTitleDraft] = useState("");
  const [descriptionDraft, setDescriptionDraft] = useState("");
  const [dueDateDraft, setDueDateDraft] = useState("");
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newComment, setNewComment] = useState("");
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  const taskQuery = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTaskById(taskId),
    enabled: Boolean(taskId),
  });

  const commentsQuery = useQuery({
    queryKey: ["task-comments", taskId],
    queryFn: () => getTaskComments(taskId),
    enabled: Boolean(taskId),
  });

  const checklistQuery = useQuery({
    queryKey: ["task-checklist", taskId],
    queryFn: () => getTaskChecklist(taskId),
    enabled: Boolean(taskId),
  });

  const checklistSummaryQuery = useQuery({
    queryKey: ["task-checklist-summary", taskId],
    queryFn: () => getTaskChecklistSummary(taskId),
    enabled: Boolean(taskId),
  });

  const activityQuery = useQuery({
    queryKey: ["task-activity", taskId],
    queryFn: () => getTaskActivity(taskId),
    enabled: Boolean(taskId),
  });

  const usersQuery = useQuery({
    queryKey: ["users", "task-detail"],
    queryFn: () => getUsers(),
    retry: false,
  });

  const tasksForSuggestionQuery = useQuery({
    queryKey: ["tasks", "suggestion"],
    queryFn: () => getTasks({ page: 1, pageSize: 100, sortBy: "createdAt", sortDescending: true }),
  });

  useEffect(() => {
    if (!taskQuery.data) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setTitleDraft(taskQuery.data.title);
      setDescriptionDraft(taskQuery.data.description);
      setDueDateDraft(taskQuery.data.dueDate ? taskQuery.data.dueDate.slice(0, 10) : "");
    }, 0);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [taskQuery.data]);

  const refreshTaskSections = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["task", taskId] }),
      queryClient.invalidateQueries({ queryKey: ["task-comments", taskId] }),
      queryClient.invalidateQueries({ queryKey: ["task-checklist", taskId] }),
      queryClient.invalidateQueries({ queryKey: ["task-checklist-summary", taskId] }),
      queryClient.invalidateQueries({ queryKey: ["task-activity", taskId] }),
      queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    ]);
  };

  const updateTaskMutation = useMutation({
    mutationFn: ({ payload }: { payload: UpdateTaskInput }) => updateTask(taskId, payload),
    onSuccess: async () => {
      toast.success("Task updated");
      await refreshTaskSections();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update task"));
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ status }: { status: string }) => updateTaskStatus(taskId, status),
    onSuccess: async () => {
      toast.success("Status updated");
      await refreshTaskSections();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update status"));
    },
  });

  const assignMutation = useMutation({
    mutationFn: ({ userId }: { userId: string }) => assignTask(taskId, userId),
    onSuccess: async () => {
      toast.success("Assignee updated");
      await refreshTaskSections();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not assign task"));
    },
  });

  const addChecklistMutation = useMutation({
    mutationFn: ({ title }: { title: string }) => addTaskChecklistItem(taskId, { title, order: 0 }),
    onSuccess: async () => {
      toast.success("Checklist item added");
      setNewChecklistTitle("");
      await refreshTaskSections();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add checklist item"));
    },
  });

  const toggleChecklistMutation = useMutation({
    mutationFn: ({ checklistItemId }: { checklistItemId: string }) =>
      toggleTaskChecklistItem(taskId, checklistItemId),
    onSuccess: async () => {
      await refreshTaskSections();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not update checklist"));
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: ({ content }: { content: string }) => addTaskComment(taskId, { content }),
    onSuccess: async () => {
      toast.success("Comment added");
      setNewComment("");
      await refreshTaskSections();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Could not add comment"));
    },
  });

  const assigneeName = useMemo(() => {
    if (!taskQuery.data?.assignedUserId) {
      return "Unassigned";
    }

    const users = usersQuery.data ?? [];
    return users.find((user) => user.id === taskQuery.data?.assignedUserId)?.name ?? "Assigned";
  }, [taskQuery.data?.assignedUserId, usersQuery.data]);

  const handleSaveTaskInfo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!taskQuery.data) {
      return;
    }

    updateTaskMutation.mutate({
      payload: {
        title: titleDraft.trim(),
        description: descriptionDraft.trim(),
        status: taskQuery.data.status,
        priority: taskQuery.data.priority,
        assignedUserId: taskQuery.data.assignedUserId ?? null,
        dueDate: dueDateDraft ? new Date(dueDateDraft).toISOString() : null,
      },
    });
  };

  const handleSuggestAssignment = () => {
    const users = usersQuery.data ?? [];
    const tasks = tasksForSuggestionQuery.data?.items ?? [];

    if (users.length === 0) {
      toast.error("User list unavailable for suggestion");
      return;
    }

    const activeCountByUser = new Map<string, number>();
    users.forEach((user) => activeCountByUser.set(user.id, 0));

    tasks.forEach((task) => {
      if (!task.assignedUserId) {
        return;
      }

      if (task.status.toLowerCase() === "done") {
        return;
      }

      const current = activeCountByUser.get(task.assignedUserId) ?? 0;
      activeCountByUser.set(task.assignedUserId, current + 1);
    });

    const sorted = [...users]
      .map((user) => ({
        user,
        activeCount: activeCountByUser.get(user.id) ?? 0,
      }))
      .sort((left, right) => left.activeCount - right.activeCount);

    const best = sorted[0];
    if (!best || !taskQuery.data) {
      toast.error("Suggestion unavailable");
      return;
    }

    const suggestedPriority = computeSuggestedPriority(taskQuery.data.dueDate);
    setSuggestion({
      userId: best.user.id,
      userName: best.user.name,
      priority: suggestedPriority,
      explanation: `${best.user.name} currently has the lightest active workload (${best.activeCount} active tasks).`,
    });
    setIsSuggestionOpen(true);
  };

  const handleApplySuggestion = () => {
    if (!taskQuery.data || !suggestion) {
      return;
    }

    updateTaskMutation.mutate({
      payload: {
        title: titleDraft.trim(),
        description: descriptionDraft.trim(),
        status: taskQuery.data.status,
        priority: suggestion.priority,
        assignedUserId: suggestion.userId,
        dueDate: dueDateDraft ? new Date(dueDateDraft).toISOString() : null,
      },
    });

    setIsSuggestionOpen(false);
  };

  if (taskQuery.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading task details...</p>;
  }

  if (taskQuery.isError || !taskQuery.data) {
    return <p className="text-sm text-destructive">{getErrorMessage(taskQuery.error, "Task not found")}</p>;
  }

  const task = taskQuery.data;
  const checklistItems = checklistQuery.data ?? [];
  const checklistSummary = checklistSummaryQuery.data;
  const comments = commentsQuery.data ?? [];
  const activities = activityQuery.data ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">{task.title}</CardTitle>
              <CardDescription>Task detail with edit controls, checklist, comments, and activity.</CardDescription>
            </div>
            <Badge variant={task.status.toLowerCase() === "done" ? "success" : "warning"}>{task.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-6">
          <form className="grid gap-4 lg:grid-cols-2" onSubmit={handleSaveTaskInfo}>
            <div className="space-y-1.5 lg:col-span-2">
              <Label htmlFor="task-title">Title</Label>
              <Input
                id="task-title"
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5 lg:col-span-2">
              <Label htmlFor="task-description">Description</Label>
              <Input
                id="task-description"
                value={descriptionDraft}
                onChange={(event) => setDescriptionDraft(event.target.value)}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={task.status}
                onChange={(event) => updateStatusMutation.mutate({ status: event.target.value })}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>Priority</Label>
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={task.priority}
                onChange={(event) => {
                  updateTaskMutation.mutate({
                    payload: {
                      title: titleDraft.trim(),
                      description: descriptionDraft.trim(),
                      status: task.status,
                      priority: event.target.value,
                      assignedUserId: task.assignedUserId ?? null,
                      dueDate: dueDateDraft ? new Date(dueDateDraft).toISOString() : null,
                    },
                  });
                }}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-due-date">Due date</Label>
              <Input
                id="task-due-date"
                type="date"
                value={dueDateDraft}
                onChange={(event) => setDueDateDraft(event.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Assigned user</Label>
              <select
                className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"
                value={task.assignedUserId ?? ""}
                onChange={(event) => {
                  const nextUserId = event.target.value;
                  if (!nextUserId) {
                    return;
                  }
                  assignMutation.mutate({ userId: nextUserId });
                }}
                disabled={usersQuery.isError}
              >
                <option value="">{assigneeName}</option>
                {(usersQuery.data ?? []).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2 flex flex-wrap gap-2">
              <Button type="submit" isLoading={updateTaskMutation.isPending}>
                Save changes
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSuggestAssignment}
                isLoading={tasksForSuggestionQuery.isFetching || usersQuery.isFetching}
              >
                <Sparkles className="h-4 w-4" />
                Suggest assignment
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={isSuggestionOpen} onOpenChange={setIsSuggestionOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>AI Assignment Suggestion</DialogTitle>
            <DialogDescription>
              Suggested assignee and priority based on current workload and due date urgency.
            </DialogDescription>
          </DialogHeader>

          {suggestion ? (
            <div className="space-y-3 rounded-lg border border-border bg-background/60 p-4 text-sm">
              <p>
                <span className="font-semibold">Suggested user:</span> {suggestion.userName}
              </p>
              <p>
                <span className="font-semibold">Suggested priority:</span> {suggestion.priority}
              </p>
              <p className="text-muted-foreground">{suggestion.explanation}</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Generate a suggestion first.</p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuggestionOpen(false)}>
              Close
            </Button>
            <Button onClick={handleApplySuggestion} disabled={!suggestion} isLoading={updateTaskMutation.isPending}>
              Apply suggestion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Checklist</CardTitle>
            <CardDescription>
              {checklistSummary
                ? `${checklistSummary.completedItems}/${checklistSummary.totalItems} complete (${Math.round(checklistSummary.percentageComplete)}%)`
                : "Track progress with checklist items"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-6">
            {checklistSummary ? (
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, checklistSummary.percentageComplete))}%` }}
                />
              </div>
            ) : null}

            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!newChecklistTitle.trim()) {
                  return;
                }

                addChecklistMutation.mutate({ title: newChecklistTitle.trim() });
              }}
            >
              <Input
                value={newChecklistTitle}
                onChange={(event) => setNewChecklistTitle(event.target.value)}
                placeholder="Add checklist item"
              />
              <Button type="submit" isLoading={addChecklistMutation.isPending}>Add</Button>
            </form>

            {checklistItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No checklist items yet.</p>
            ) : (
              checklistItems.map((item) => (
                <label key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                  <span className="text-sm">{item.title}</span>
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    onChange={() => toggleChecklistMutation.mutate({ checklistItemId: item.id })}
                  />
                </label>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
            <CardDescription>Discuss task updates with your team.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pb-6">
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                if (!newComment.trim()) {
                  return;
                }
                addCommentMutation.mutate({ content: newComment.trim() });
              }}
            >
              <Input
                value={newComment}
                onChange={(event) => setNewComment(event.target.value)}
                placeholder="Add a comment"
              />
              <Button type="submit" isLoading={addCommentMutation.isPending}>Post</Button>
            </form>

            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{comment.authorName}</p>
                    <span className="text-xs text-muted-foreground">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{comment.content}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity log</CardTitle>
          <CardDescription>Recent task events from backend activity tracking.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 pb-6">
          {activities.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="rounded-lg border border-border p-3 text-sm">
                <p className="font-medium">{activity.action}</p>
                <p className="text-xs text-muted-foreground">
                  {activity.oldValue ? `${activity.oldValue} -> ` : ""}
                  {activity.newValue ?? "-"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDate(activity.createdAt)}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}