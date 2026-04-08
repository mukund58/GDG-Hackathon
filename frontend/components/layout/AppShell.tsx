import type { ReactNode } from "react";
import { MainNav } from "@/components/layout/MainNav";
import { PageContainer } from "@/components/layout/PageContainer";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-[var(--color-border)]/80 bg-[rgba(255,248,236,0.9)] backdrop-blur">
        <PageContainer className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--color-muted)]">GDG Hackathon</p>
            <h1 className="text-2xl font-semibold tracking-tight">GDG Taskboard</h1>
          </div>
          <MainNav />
        </PageContainer>
      </header>

      <main>
        <PageContainer className="py-8 md:py-10">{children}</PageContainer>
      </main>
    </div>
  );
}