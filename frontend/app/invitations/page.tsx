"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ApiError } from "@/services/api";
import { acceptProjectInvitation, getMyProjectInvitations } from "@/services/project";
import type { MyProjectInvitation } from "@/types/project";

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

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
}

function getEffectiveStatus(invitation: MyProjectInvitation) {
  if (invitation.isExpired && invitation.status === "Pending") {
    return "Expired";
  }

  return invitation.status;
}

function getStatusBadgeVariant(status: string) {
  if (status === "Accepted") {
    return "success" as const;
  }

  if (status === "Pending") {
    return "secondary" as const;
  }

  if (status === "Expired") {
    return "warning" as const;
  }

  return "danger" as const;
}

export default function MyInvitationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const invitationsQuery = useQuery({
    queryKey: ["my-project-invitations"],
    queryFn: getMyProjectInvitations,
  });

  const acceptMutation = useMutation({
    mutationFn: (invitationId: string) => acceptProjectInvitation(invitationId),
    onSuccess: (result) => {
      toast.success("Invitation accepted. Opening project...");
      void queryClient.invalidateQueries({ queryKey: ["my-project-invitations"] });
      router.push(`/projects/${result.projectId}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to accept invitation"));
    },
  });

  if (invitationsQuery.isLoading) {
    return (
      <div className="grid gap-4">
        <Card className="animate-pulse">
          <CardHeader className="space-y-3">
            <div className="h-6 w-48 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </CardHeader>
          <CardContent className="space-y-3 pb-6">
            <div className="h-12 rounded bg-muted" />
            <div className="h-12 rounded bg-muted" />
            <div className="h-12 rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (invitationsQuery.isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Unable to load invitations</CardTitle>
          <CardDescription>{getErrorMessage(invitationsQuery.error, "Please try again")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 pb-6">
          <Button type="button" onClick={() => invitationsQuery.refetch()}>
            Retry
          </Button>
          <Button asChild variant="outline">
            <Link href="/projects">Open projects</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const invitations = invitationsQuery.data ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle>My Invitations</CardTitle>
            <CardDescription>
              Review project invitations sent to your account and accept any pending invite.
            </CardDescription>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => invitationsQuery.refetch()}>
            Refresh
          </Button>
        </CardHeader>
      </Card>

      {invitations.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">You do not have any invitations right now.</p>
            <Button asChild variant="outline" size="sm">
              <Link href="/projects">Go to projects</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {invitations.map((invitation) => {
            const effectiveStatus = getEffectiveStatus(invitation);
            const isPending = effectiveStatus === "Pending";
            const isAccepted = effectiveStatus === "Accepted";
            const isLoadingThisInvitation =
              acceptMutation.isPending && acceptMutation.variables === invitation.id;

            return (
              <Card key={invitation.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">{invitation.projectName}</CardTitle>
                    <Badge variant={getStatusBadgeVariant(effectiveStatus)}>{effectiveStatus}</Badge>
                  </div>
                  <CardDescription>
                    Role: {invitation.role} • Invited by {invitation.invitedByUserName}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pb-6">
                  <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <p>
                      <span className="font-semibold">Invited email:</span> {invitation.email}
                    </p>
                    <p>
                      <span className="font-semibold">Created:</span> {formatDate(invitation.createdAt)}
                    </p>
                    <p>
                      <span className="font-semibold">Expires:</span> {formatDate(invitation.expiresAt)}
                    </p>
                    <p>
                      <span className="font-semibold">Invitation ID:</span> {invitation.id}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/invitations/${invitation.id}`}>View details</Link>
                    </Button>

                    {isPending ? (
                      <Button
                        type="button"
                        size="sm"
                        isLoading={isLoadingThisInvitation}
                        disabled={acceptMutation.isPending && !isLoadingThisInvitation}
                        onClick={() => acceptMutation.mutate(invitation.id)}
                      >
                        Accept invitation
                      </Button>
                    ) : null}

                    {isAccepted ? (
                      <Button type="button" size="sm" onClick={() => router.push(`/projects/${invitation.projectId}`)}>
                        Open project
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
