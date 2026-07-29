import { createFileRoute } from "@tanstack/react-router";
import { Bell, CheckCheck, Clock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/molade/empty-state";
import { useMolade, useNow } from "@/store/molade-store";
import {
  NOTIFICATION_ICONS,
  NotificationActions,
  isNotificationActive,
  notificationTone,
} from "@/components/molade/notifications-center";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Molade" },
      { name: "description", content: "Deadline reminders, priority changes and overdue alerts, with email timing you control." },
      { property: "og:title", content: "Notifications — Molade" },
      { property: "og:description", content: "Reminders that arrive before the deadline, not after." },
    ],
  }),
  component: Notifications,
});

const LEADS = ["24h", "12h", "3h"] as const;

function Notifications() {
  const { notifications, markAllRead, markNotificationRead, prefs, setPrefs, tasks, unsnoozeTask } =
    useMolade();
  const now = useNow();
  const active = notifications.filter((n) => isNotificationActive(n, now));
  const snoozed = notifications.filter((n) => !isNotificationActive(n, now));
  const unread = active.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="rise grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <h1 className="text-[clamp(1.9rem,4vw,2.5rem)] leading-tight">Notifications</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {unread ? `${unread} unread` : "You’re all caught up"} · Reminders follow your email
            timing preference.
          </p>
        </div>
        {unread > 0 && (
          <Button variant="outline" className="border-border" onClick={markAllRead}>
            <CheckCheck className="size-4" /> Mark all read
          </Button>
        )}
      </header>

      {active.length === 0 ? (
        <EmptyState
          className="mt-10"
          icon={<Bell className="size-5" />}
          title={notifications.length === 0 ? "Nothing yet" : "All clear"}
          body={
            notifications.length === 0
              ? "Reminders and priority changes will appear here."
              : "Everything is dismissed or snoozed. Snoozed reminders come back on their own."
          }
        />
      ) : (
        <ul className="mt-9 divide-y divide-border/60" aria-label="Active reminders">
          {active.map((n) => {
            const Icon = NOTIFICATION_ICONS[n.type];
            return (
              <li key={n.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-4 py-5">
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border",
                    notificationTone(n.type),
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className={cn("text-sm", n.read ? "text-muted-foreground" : "font-semibold")}>
                      {n.title}
                      {!n.read && <span className="sr-only"> (unread)</span>}
                    </p>
                    <span className="text-[11px] whitespace-nowrap text-muted-foreground">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <NotificationActions id={n.id} />
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => markNotificationRead(n.id)}
                        className="press rounded-full border border-teal/40 bg-teal/10 px-2.5 py-1 text-[11px] font-semibold text-teal"
                      >
                        Mark read
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {snoozed.length > 0 && (
        <section className="mt-12 rounded-2xl border border-border bg-surface/40 p-5">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Clock className="size-4 text-muted-foreground" aria-hidden="true" /> Snoozed
          </h2>
          <p className="mt-1.5 text-xs text-muted-foreground">
            These reminders are paused, and their tasks sit lower in your ranking until they return.
          </p>
          <ul className="mt-4 space-y-3">
            {snoozed.map((n) => {
              const task = tasks.find((t) => t.id === n.taskId);
              return (
                <li key={n.id} className="flex flex-wrap items-center justify-between gap-3 text-xs">
                  <span className="min-w-0 truncate text-muted-foreground">
                    {n.title} · back{" "}
                    {new Date(n.snoozedUntil!).toLocaleString(undefined, {
                      weekday: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      markNotificationRead(n.id);
                      setPrefs({});
                      if (task) unsnoozeTask(task.id);
                    }}
                    className="press inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 font-medium text-teal"
                  >
                    <RotateCcw className="size-3" aria-hidden="true" /> Restore now
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mt-14 border-t border-border/60 pt-10">
        <h2 className="text-xl">Email reminders</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Choose how far ahead of a deadline Molade emails you.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {LEADS.map((l) => (
            <button
              key={l}
              onClick={() => setPrefs({ lead: l })}
              aria-pressed={prefs.lead === l}
              className={cn(
                "rounded-full border px-4 py-2 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                prefs.lead === l
                  ? "border-teal/50 bg-teal/15 text-teal"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {l} before due
            </button>
          ))}
        </div>

        <div className="mt-8 space-y-5">
          {(
            [
              ["email", "Email reminders", "Deadline emails at your chosen lead time."],
              ["push", "Browser notifications", "Alerts while Molade is open in a tab."],
              ["priorityChanges", "Priority change alerts", "Tell me when a task jumps in the ranking."],
              ["weeklyDigest", "Weekly summary", "A Sunday recap of what landed and what’s next."],
            ] as const
          ).map(([key, label, hint]) => (
            <div key={key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <div className="min-w-0">
                <Label htmlFor={key} className="text-sm">
                  {label}
                </Label>
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
              </div>
              <Switch id={key} checked={prefs[key]} onCheckedChange={(v) => setPrefs({ [key]: v })} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
