import { useEffect, useState } from "react";
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
import { MotionConfig, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskFormDialog } from "./task-form";
import { NotificationsCenter, isNotificationActive } from "./notifications-center";
import { OnboardingTour } from "./onboarding-tour";
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

/** Light haptic tick on devices that support it — silently ignored elsewhere. */
export function tapFeedback(pattern: number | number[] = 8) {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* no-op */
    }
  }
}

export function AppShell() {
  const { user, notifications, ranked, addTask, reducedMotion } = useMolade();
  const now = useNow();
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = notifications.filter((n) => isNotificationActive(n, now) && !n.read).length;
  const nextUp = ranked.find((r) => r.task.status !== "completed");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
    <div className="atmosphere grain min-h-screen">
      <a href="#molade-main" className="skip-link">
        Skip to main content
      </a>
      <div className="mx-auto flex w-full max-w-[1600px]">
        {/* Sidebar — desktop */}
        <aside aria-label="Primary" className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/70 px-4 py-6 lg:flex">
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
            <div className="flex w-full items-center gap-3 px-4 py-3 sm:px-6 lg:gap-4 lg:px-10">
              <div className="flex shrink-0 items-center gap-2 lg:hidden">
                <button
                  onClick={() => {
                    tapFeedback();
                    setOpen((v) => !v);
                  }}
                  aria-label={open ? "Close navigation menu" : "Open navigation menu"}
                  aria-expanded={open}
                  aria-controls="molade-mobile-nav"
                  className="press grid size-9 place-items-center rounded-lg border border-border"
                >
                  {open ? <X className="size-4" aria-hidden="true" /> : <Menu className="size-4" aria-hidden="true" />}
                </button>
              </div>
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tasks, modules…"
                  className="h-9 w-full pl-9"
                  aria-label="Search"
                />
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button size="sm" className="hidden sm:inline-flex" onClick={() => setCreating(true)}>
                  <Plus className="size-4" /> New task
                </Button>
                <NotificationsCenter now={now} />
                <Link
                  to="/app/settings"
                  aria-label="Profile"
                  className="grid size-9 place-items-center rounded-full border border-teal/40 bg-teal/12 text-xs font-bold text-teal"
                >
                  {user.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)}
                </Link>
              </div>
            </div>

            {/* Mobile nav drawer */}
            {open && (
              <motion.nav
                id="molade-mobile-nav"
                aria-label="Primary"
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
              <div aria-label="Next up" className="flex items-center gap-3 overflow-hidden border-t border-border/70 bg-surface/40 px-4 py-2 sm:px-6">
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

          <main id="molade-main" tabIndex={-1} className="px-4 pt-8 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:px-6 lg:px-10 lg:pb-16">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Bottom nav — mobile */}
      <nav aria-label="Primary mobile" className="pb-safe px-safe fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 rounded-2xl border border-border/70 bg-background/80 p-1.5 shadow-[0_18px_40px_-18px_oklch(0_0_0/0.8)] backdrop-blur-2xl">
          {NAV.slice(0, 5).map((item) => {
            const active = "exact" in item && item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <motion.div
                key={item.to}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 600, damping: 26 }}
              >
                <Link
                  to={item.to}
                  aria-label={
                    item.label === "Notifications" && unread
                      ? `${item.label}, ${unread} unread`
                      : item.label
                  }
                  aria-current={active ? "page" : undefined}
                  onClick={() => tapFeedback()}
                  className={cn(
                    "relative flex touch-manipulation flex-col items-center gap-1 rounded-xl py-2 text-[10px] transition-colors duration-200",
                    active ? "text-teal" : "text-muted-foreground",
                  )}
                  style={{ WebkitTapHighlightColor: "transparent" }}
                >
                  {active && (
                    <motion.span
                      layoutId="molade-tab"
                      transition={{ type: "spring", stiffness: 480, damping: 38, mass: 0.7 }}
                      className="absolute inset-0 rounded-xl bg-teal/12 ring-1 ring-teal/25"
                    />
                  )}
                  <motion.span
                    className="relative"
                    animate={active ? { y: -1, scale: 1.06 } : { y: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 520, damping: 30 }}
                  >
                    <item.icon className="size-[18px]" />
                    {item.label === "Notifications" && unread > 0 && (
                      <span className="absolute -top-1 -right-1.5 size-1.5 rounded-full bg-amber" />
                    )}
                  </motion.span>
                  <motion.span
                    className="relative truncate"
                    animate={{ opacity: active ? 1 : 0.75 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </nav>

      <TaskFormDialog
        open={creating}
        onOpenChange={setCreating}
        onSave={(d) => addTask({ ...d, completedAt: undefined })}
      />
      <OnboardingTour />
      <span className="sr-only">{now}</span>
    </div>
    </MotionConfig>
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
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        active ? "bg-teal/12 text-teal" : "text-muted-foreground hover:bg-surface/70 hover:text-foreground",
      )}
    >
      <item.icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{item.label}</span>
      {!!badge && (
        <span className="ml-auto rounded-full bg-amber/20 px-1.5 text-[10px] font-bold text-amber">
          {badge}
          <span className="sr-only"> unread</span>
        </span>
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
