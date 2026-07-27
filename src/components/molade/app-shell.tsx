import { useState } from "react";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ListChecks,
  Sparkles,
  BarChart3,
  Bell,
  Settings,
  Search,
  Plus,
  ArrowRight,
  Menu,
  X,
} from "lucide-react";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskFormDialog } from "./task-form";
import { PriorityBadge } from "./priority-badge";
import { useMolade, useNow } from "@/store/molade-store";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/tasks", label: "Tasks", icon: ListChecks },
  { to: "/app/priorities", label: "Priorities", icon: Sparkles },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/notifications", label: "Notifications", icon: Bell },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const satisfies readonly { to: string; label: string; icon: typeof Bell; exact?: boolean }[];

export function AppShell() {
  const { user, notifications, ranked, addTask } = useMolade();
  const now = useNow();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = notifications.filter((n) => !n.read).length;
  const nextUp = ranked.find((r) => r.task.status !== "completed");

  return (
    <div className="atmosphere grain min-h-screen">
      <div className="mx-auto flex w-full max-w-[1600px]">
        {/* Sidebar — desktop */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 px-4 py-6 lg:flex">
          <BrandMark />
          <nav className="mt-8 flex flex-1 flex-col gap-1">
            {NAV.map((item) => (
              <NavItem key={item.to} item={item} pathname={pathname} badge={item.label === "Notifications" ? unread : 0} />
            ))}
          </nav>
          <div className="rounded-xl border border-border bg-surface/60 p-4">
            <p className="text-xs text-muted-foreground">Signed in as</p>
            <p className="mt-1 truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.programme}</p>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {/* Top bar */}
          <header className="sticky top-0 z-30 border-b border-border/70 bg-background/70 backdrop-blur-xl">
            <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6">
              <div className="flex items-center gap-2 lg:hidden">
                <button
                  onClick={() => setOpen((v) => !v)}
                  aria-label="Toggle navigation"
                  className="grid size-9 place-items-center rounded-lg border border-border"
                >
                  {open ? <X className="size-4" /> : <Menu className="size-4" />}
                </button>
              </div>
              <div className="relative min-w-0 lg:max-w-md">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tasks, modules…"
                  className="h-9 pl-9"
                  aria-label="Search"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" className="hidden sm:inline-flex" onClick={() => setCreating(true)}>
                  <Plus className="size-4" /> New task
                </Button>
                <Link
                  to="/app/notifications"
                  aria-label="Notifications"
                  className="relative grid size-9 place-items-center rounded-lg border border-border transition-colors hover:border-teal/50"
                >
                  <Bell className="size-4" />
                  {unread > 0 && (
                    <span className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-amber text-[10px] font-bold text-background">
                      {unread}
                    </span>
                  )}
                </Link>
                <Link
                  to="/app/settings"
                  aria-label="Profile"
                  className="grid size-9 place-items-center rounded-full border border-teal/40 bg-teal/12 text-xs font-bold text-teal"
                >
                  {user.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                </Link>
              </div>
            </div>

            {/* Mobile nav drawer */}
            {open && (
              <motion.nav
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid gap-1 border-t border-border/70 px-4 py-3 lg:hidden"
              >
                {NAV.map((item) => (
                  <div key={item.to} onClick={() => setOpen(false)}>
                    <NavItem item={item} pathname={pathname} badge={item.label === "Notifications" ? unread : 0} />
                  </div>
                ))}
              </motion.nav>
            )}

            {/* Persistent Next up strip */}
            {nextUp && (
              <div className="flex items-center gap-3 overflow-hidden border-t border-border/70 bg-surface/40 px-4 py-2 sm:px-6">
                <span className="shrink-0 text-[10px] tracking-[0.18em] text-muted-foreground uppercase">
                  Next up
                </span>
                <Link
                  to="/app/tasks/$taskId"
                  params={{ taskId: nextUp.task.id }}
                  className="min-w-0 flex-1 truncate text-sm font-medium hover:text-teal"
                >
                  {nextUp.task.title}
                  <span className="ml-2 hidden text-xs text-muted-foreground sm:inline">{nextUp.summary}</span>
                </Link>
                <PriorityBadge level={nextUp.level} />
                <Link
                  to="/app/priorities"
                  className="hidden shrink-0 items-center gap-1 text-xs text-teal hover:underline sm:inline-flex"
                >
                  Why <ArrowRight className="size-3" />
                </Link>
              </div>
            )}
          </header>

          <main className="px-4 pt-8 pb-28 sm:px-6 lg:px-10 lg:pb-16">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Bottom nav — mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 rounded-2xl border border-border/70 bg-background/80 p-1.5 shadow-[0_18px_40px_-18px_oklch(0_0_0/0.8)] backdrop-blur-2xl">
          {NAV.slice(0, 5).map((item) => {
            const active = "exact" in item && item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-label={item.label}
                className={cn(
                  "relative flex flex-col items-center gap-1 rounded-xl py-2 text-[10px] transition-colors",
                  active ? "text-teal" : "text-muted-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="molade-tab"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-xl bg-teal/12 ring-1 ring-teal/25"
                  />
                )}
                <span className="relative">
                  <item.icon className="size-[18px]" />
                  {item.label === "Notifications" && unread > 0 && (
                    <span className="absolute -top-1 -right-1.5 size-1.5 rounded-full bg-amber" />
                  )}
                </span>
                <span className="relative truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <TaskFormDialog
        open={creating}
        onOpenChange={setCreating}
        onSave={(d) => addTask({ ...d, completedAt: undefined })}
      />
      <span className="sr-only">{now}</span>
    </div>
  );
}

function NavItem({
  item,
  pathname,
  badge,
}: {
  item: (typeof NAV)[number];
  pathname: string;
  badge?: number;
}) {
  const active = "exact" in item && item.exact ? pathname === item.to : pathname.startsWith(item.to);
  return (
    <Link
      to={item.to}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        active ? "bg-teal/12 text-teal" : "text-muted-foreground hover:bg-surface/70 hover:text-foreground",
      )}
    >
      <item.icon className="size-4 shrink-0" />
      <span className="truncate">{item.label}</span>
      {!!badge && (
        <span className="ml-auto rounded-full bg-amber/20 px-1.5 text-[10px] font-bold text-amber">{badge}</span>
      )}
    </Link>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5", className)}>
      <span className="grid size-8 place-items-center rounded-lg border border-teal/40 bg-teal/12">
        <span className="font-display text-sm text-teal">M</span>
      </span>
      <span className="font-display text-lg tracking-tight">Molade</span>
    </Link>
  );
}
