"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ApiError } from "@/services/api";
import { clearAuthToken } from "@/services/auth/token-store";
import { acceptProjectInvitation, getProjectInvitationById } from "@/services/project";
import { useAuthStore } from "@/store/authStore";

function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

function getEffectiveStatus(status: string, isExpired: boolean) {
  if (isExpired && status === "Pending") {
    return "Expired";
  }

  return status;
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

function buildAuthHref(path: string, redirectPath: string) {
  const search = new URLSearchParams({ redirect: redirectPath });
  return `${path}?${search.toString()}`;
}

export default function InvitationPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const invitationId = String(params.id ?? "");

  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearSession = useAuthStore((state) => state.clearSession);
  const currentUserEmail = useAuthStore((state) => state.user?.email?.trim().toLowerCase() ?? "");

  const invitationQuery = useQuery({
    queryKey: ["project-invitation", invitationId],
    queryFn: () => getProjectInvitationById(invitationId),
    enabled: Boolean(invitationId),
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: () => acceptProjectInvitation(invitationId),
    onSuccess: (result) => {
      toast.success("Invitation accepted. Opening project...");
      router.push(`/projects/${result.projectId}`);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Unable to accept invitation"));
    },
  });

  const authRedirectPath = useMemo(() => `/invitations/${invitationId}`, [invitationId]);
  const loginHref = useMemo(() => buildAuthHref("/auth/login", authRedirectPath), [authRedirectPath]);
  const registerHref = useMemo(() => buildAuthHref("/auth/register", authRedirectPath), [authRedirectPath]);

  const continueWithDifferentAccount = (path: "/auth/login" | "/auth/register") => {
    clearAuthToken();
    clearSession();
    router.push(buildAuthHref(path, authRedirectPath));
  };

  if (invitationQuery.isLoading) {
    return (
      <Card className="animate-pulse">
        <CardHeader className="space-y-3">
          <div className="h-6 w-44 rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-3 pb-6">
          <div className="h-10 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
          <div className="h-10 rounded bg-muted" />
        </CardContent>
      </Card>
    );
  }

  if (invitationQuery.isError || !invitationQuery.data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invitation unavailable</CardTitle>
          <CardDescription>{getErrorMessage(invitationQuery.error, "Invitation could not be loaded")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 pb-6">
          <Button asChild>
            <Link href="/projects">Go to projects</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const invitation = invitationQuery.data;
  const effectiveStatus = getEffectiveStatus(invitation.status, invitation.isExpired);
  const isPending = effectiveStatus === "Pending";
  const isAccepted = effectiveStatus === "Accepted";
  const isExpired = effectiveStatus === "Expired";
  const matchesCurrentAccount = currentUserEmail
    ? invitation.email.trim().toLowerCase() === currentUserEmail
    : null;

  const canAccept = Boolean(isAuthenticated && isPending && matchesCurrentAccount);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Project Invitation</CardTitle>
          <Badge variant={getStatusBadgeVariant(effectiveStatus)}>{effectiveStatus}</Badge>
        </div>
        <CardDescription>
          Review this invitation and accept it to get project access.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 pb-6">
        <div className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-2">
          <p className="text-sm">
            <span className="font-semibold">Project:</span> {invitation.projectName}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Role:</span> {invitation.role}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Invited email:</span> {invitation.email}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Invited by:</span> {invitation.invitedByUserName}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Created:</span> {formatDate(invitation.createdAt)}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Expires:</span> {formatDate(invitation.expiresAt)}
          </p>
        </div>

        {!isAuthenticated ? (
          <div className="space-y-3 rounded-lg border border-border p-4">
            <p className="text-sm text-muted-foreground">
              Sign in or create an account to accept this invitation.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={loginHref}>Sign in</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={registerHref}>Create account</Link>
              </Button>
            </div>
          </div>
        ) : null}

        {isAuthenticated && isExpired ? (
          <p className="text-sm text-destructive">This invitation is expired and can no longer be accepted.</p>
        ) : null}

        {isAuthenticated && isAccepted && matchesCurrentAccount !== false ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">This invitation was already accepted.</p>
            <Button onClick={() => router.push(`/projects/${invitation.projectId}`)}>
              Open project
            </Button>
          </div>
        ) : null}

        {isAuthenticated && matchesCurrentAccount === false ? (
          <div className="space-y-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">
              This invitation is for {invitation.email}. Continue with that account to review and accept it.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => continueWithDifferentAccount("/auth/login")}>
                Sign in with another account
              </Button>
              <Button type="button" variant="outline" onClick={() => continueWithDifferentAccount("/auth/register")}>
                Create account
              </Button>
            </div>
          </div>
        ) : null}

        {isAuthenticated && canAccept ? (
          <Button isLoading={acceptMutation.isPending} onClick={() => acceptMutation.mutate()}>
            Accept invitation
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
