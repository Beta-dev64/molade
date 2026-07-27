import { Clock, AlertTriangle } from "lucide-react";
import { countdownLabel, hoursUntil } from "@/lib/molade/priority";
import { cn } from "@/lib/utils";

export function DeadlineCountdown({
  deadline,
  now,
  completed,
  className,
}: {
  deadline: string;
  now: number;
  completed?: boolean;
  className?: string;
}) {
  const h = hoursUntil(deadline, now);
  const overdue = h < 0 && !completed;
  const soon = h >= 0 && h <= 24 && !completed;
  const Icon = overdue ? AlertTriangle : Clock;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        overdue ? "text-crit" : soon ? "text-amber" : "text-muted-foreground",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {completed ? "Submitted" : countdownLabel(deadline, now)}
    </span>
  );
}
