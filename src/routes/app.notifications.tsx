import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, Bell, CalendarClock, CheckCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { EmptyState } from "@/components/molade/empty-state";
import { useMolade } from "@/store/molade-store";
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

const ICONS = {
  deadline: CalendarClock,
  priority: Sparkles,
  overdue: AlertTriangle,
  system: Bell,
} as const;

const LEADS = ["24h", "12h", "3h"] as const;

function Notifications() {
  const { notifications, markAllRead, markNotificationRead, prefs, setPrefs } = useMolade();
  const unread = notifications.filter((n) => !n.read).length;

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

      {notifications.length === 0 ? (
        <EmptyState className="mt-10" icon={<Bell className="size-5" />} title="Nothing yet" body="Reminders and priority changes will appear here." />
      ) : (
        <ul className="mt-9 divide-y divide-border/60">
          {notifications.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <li key={n.id}>
                <button
                  onClick={() => markNotificationRead(n.id)}
                  className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4 py-5 text-left transition-colors hover:bg-surface/40"
                >
                  <span
                    className={cn(
                      "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border",
                      n.type === "overdue"
                        ? "border-crit/40 bg-crit/12 text-crit"
                        : n.type === "deadline"
                          ? "border-amber/40 bg-amber/12 text-amber"
                          : "border-teal/40 bg-teal/12 text-teal",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className={cn("text-sm", n.read ? "text-muted-foreground" : "font-semibold")}>{n.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{n.body}</p>
                  </div>
                  <span className="text-[11px] whitespace-nowrap text-muted-foreground">
                    {new Date(n.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
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
