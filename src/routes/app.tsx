import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MoladeProvider } from "@/store/molade-store";
import { AppShell } from "@/components/molade/app-shell";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title: "Molade — Your ranked workload" },
      { name: "description", content: "Your coursework, ranked automatically by deadline, workload and status." },
    ],
  }),
  component: AppLayout,
});

function AppLayout() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return <AppSkeleton />;

  return (
    <MoladeProvider>
      <AppShell />
    </MoladeProvider>
  );
}

function AppSkeleton() {
  return (
    <div className="atmosphere grain min-h-screen">
      <div className="mx-auto flex max-w-[1600px]">
        <div className="hidden w-64 shrink-0 flex-col gap-3 border-r border-border/70 p-6 lg:flex">
          <Skeleton className="h-8 w-32" />
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
        <div className="min-w-0 flex-1 p-6 sm:p-10">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="mt-4 h-5 w-80" />
          <Skeleton className="mt-10 h-36 w-full rounded-2xl" />
          <div className="mt-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
