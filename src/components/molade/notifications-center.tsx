import { Link } from "@tanstack/react-router";
import { AlertTriangle, Bell, CalendarClock, Clock, Sparkles, X, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMolade } from "@/store/molade-store";
import type { AppNotification } from "@/lib/molade/types";
import { cn } from "@/lib/utils";

export const NOTIFICATION_ICONS = {
  deadline: CalendarClock,
  priority: Sparkles,
  overdue: AlertTriangle,
  system: Bell,
} as const;

/** A reminder is active unless it has been snoozed into the future. */
export function isNotificationActive(n: AppNotification, now: number) {
  return !n.snoozedUntil || new Date(n.snoozedUntil).getTime() <= now;
}

export function notificationTone(type: AppNotification["type"]) {
  return type === "overdue"
    ? "border-crit/40 bg-crit/12 text-crit"
    : type === "deadline"
      ? "border-amber/40 bg-amber/12 text-amber"
      : "border-teal/40 bg-teal/12 text-teal";
}

/** Dismiss + snooze controls. Snoozing a task-linked reminder re-ranks the task. */
export function NotificationActions({ id, className }: { id: string; className?: string }) {
  const { dismissNotification, snoozeNotification } = useMolade();
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {[3, 24].map((h) => (
        <button
          key={h}
          type="button"
          onClick={() => snoozeNotification(id, h)}
          className="press inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-teal/50 hover:text-foreground"
        >
          <Clock className="size-3" aria-hidden="true" /> Snooze {h}h
        </button>
      ))}
      <button
        type="button"
        onClick={() => dismissNotification(id)}
        className="press inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-crit/50 hover:text-crit"
      >
        <X className="size-3" aria-hidden="true" /> Dismiss
      </button>
    </div>
  );
}

export function NotificationsCenter({ now }: { now: number }) {
  const { notifications, markAllRead, markNotificationRead } = useMolade();
  const active = notifications.filter((n) => isNotificationActive(n, now));
  const unread = active.filter((n) => !n.read).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
          className="press relative grid size-9 place-items-center rounded-lg border border-border transition-colors hover:border-teal/50"
        >
          <Bell className="size-4" aria-hidden="true" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute -top-1 -right-1 grid size-4 place-items-center rounded-full bg-amber text-[10px] font-bold text-background"
            >
              {unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[min(22rem,calc(100vw-1.5rem))] p-0"
        aria-label="Notifications center"
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/70 px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <Button size="sm" variant="ghost" className="h-7 px-2 text-xs" onClick={markAllRead}>
              <CheckCheck className="size-3.5" aria-hidden="true" /> Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-[22rem] overflow-y-auto">
          {active.length === 0 ? (
            <p className="px-4 py-8 text-center text-xs text-muted-foreground">
              Nothing needs you right now. Snoozed reminders return automatically.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {active.map((n) => {
                const Icon = NOTIFICATION_ICONS[n.type];
                return (
                  <li key={n.id} className="px-4 py-3">
                    <div className="flex gap-3">
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border",
                          notificationTone(n.type),
                        )}
                      >
                        <Icon className="size-3.5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={cn("text-xs", n.read ? "text-muted-foreground" : "font-semibold")}>
                          {n.title}
                          {!n.read && <span className="sr-only"> (unread)</span>}
                        </p>
                        <p className="mt-1 line-clamp-2 text-[11px] text-muted-foreground">{n.body}</p>
                        <NotificationActions id={n.id} className="mt-2" />
                        {!n.read && (
                          <button
                            type="button"
                            onClick={() => markNotificationRead(n.id)}
                            className="mt-2 text-[11px] font-semibold text-teal hover:underline"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-border/70 px-4 py-2.5">
          <Link to="/app/notifications" className="text-xs font-semibold text-teal hover:underline">
            Open notifications centre
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
