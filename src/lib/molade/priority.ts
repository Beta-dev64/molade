import type { Effort, PriorityLevel, PriorityReason, RankedTask, Task } from "./types";

export const EFFORT_HOURS: Record<Effort, number> = { S: 2, M: 6, L: 14 };
export const EFFORT_LABEL: Record<Effort, string> = {
  S: "Small · ~2h",
  M: "Medium · ~6h",
  L: "Large · ~14h",
};

export const STATUS_LABEL: Record<Task["status"], string> = {
  not_started: "Not started",
  in_progress: "In progress",
  blocked: "Blocked",
  completed: "Completed",
};

export function hoursUntil(deadline: string, now: number): number {
  return (new Date(deadline).getTime() - now) / 36e5;
}

export function countdownLabel(deadline: string, now: number): string {
  const h = hoursUntil(deadline, now);
  const abs = Math.abs(h);
  const unit =
    abs < 1
      ? `${Math.max(1, Math.round(abs * 60))}m`
      : abs < 48
        ? `${Math.round(abs)}h`
        : `${Math.round(abs / 24)}d`;
  if (h < 0) return `Overdue by ${unit}`;
  if (h < 1) return `Due in ${unit}`;
  if (h < 24) return `Due in ${unit}`;
  if (h < 48) return "Due tomorrow";
  return `Due in ${unit}`;
}

/**
 * Transparent, rule-based ranking. Every contribution is returned as a reason
 * so the UI can explain exactly why a task sits where it does.
 */
export function rankTask(task: Task, now: number): RankedTask {
  const hoursLeft = hoursUntil(task.deadline, now);
  const reasons: PriorityReason[] = [];
  let score = 0;

  // 1. Deadline proximity
  let deadlinePoints: number;
  let deadlineDetail: string;
  if (hoursLeft < 0) {
    deadlinePoints = 46;
    deadlineDetail = `Deadline passed ${countdownLabel(task.deadline, now).toLowerCase().replace("overdue by ", "")} ago`;
  } else if (hoursLeft <= 24) {
    deadlinePoints = 42;
    deadlineDetail = `Less than 24 hours remaining`;
  } else if (hoursLeft <= 72) {
    deadlinePoints = 30;
    deadlineDetail = `Due within 3 days`;
  } else if (hoursLeft <= 168) {
    deadlinePoints = 18;
    deadlineDetail = `Due this week`;
  } else {
    deadlinePoints = 8;
    deadlineDetail = `More than a week away`;
  }
  score += deadlinePoints;
  reasons.push({
    kind: "deadline",
    label: "Deadline proximity",
    detail: deadlineDetail,
    weight: deadlinePoints,
  });

  // 2. Effort / workload vs time left
  const need = EFFORT_HOURS[task.effort];
  const pressure = hoursLeft <= 0 ? 3 : need / Math.max(hoursLeft, 1);
  const effortPoints = Math.round(Math.min(24, 6 + pressure * 18));
  score += effortPoints;
  reasons.push({
    kind: "effort",
    label: "Workload vs time",
    detail:
      pressure >= 0.5
        ? `${EFFORT_LABEL[task.effort]} — tight against the remaining window`
        : `${EFFORT_LABEL[task.effort]} — comfortable against the remaining window`,
    weight: effortPoints,
  });

  // 3. Status
  const statusPoints =
    task.status === "completed"
      ? -60
      : task.status === "blocked"
        ? 14
        : task.status === "not_started"
          ? 12
          : 5;
  score += statusPoints;
  reasons.push({
    kind: "status",
    label: "Status",
    detail:
      task.status === "not_started"
        ? "Nothing started yet"
        : task.status === "in_progress"
          ? "Already underway"
          : task.status === "blocked"
            ? "Blocked — needs unblocking early"
            : "Completed",
    weight: statusPoints,
  });

  // 4. Overdue risk
  if (hoursLeft < 0 && task.status !== "completed") {
    score += 18;
    reasons.push({
      kind: "risk",
      label: "Overdue risk",
      detail: "Already past the submission date",
      weight: 18,
    });
  } else if (hoursLeft < need && task.status !== "completed") {
    score += 12;
    reasons.push({
      kind: "risk",
      label: "Overdue risk",
      detail: "Estimated effort exceeds the time left",
      weight: 12,
    });
  }

  // 5. Your own preference (nudge only — the system still ranks)
  if (task.personalPreference === "high") {
    score += 6;
    reasons.push({
      kind: "preference",
      label: "Your preference",
      detail: "You flagged this as personally important",
      weight: 6,
    });
  } else if (task.personalPreference === "low") {
    score -= 6;
    reasons.push({
      kind: "preference",
      label: "Your preference",
      detail: "You marked this as low personal priority",
      weight: -6,
    });
  }

  const level: PriorityLevel =
    task.status === "completed"
      ? "Low"
      : score >= 78
        ? "Critical"
        : score >= 60
          ? "High"
          : score >= 42
            ? "Medium"
            : "Low";

  const summary = [
    countdownLabel(task.deadline, now),
    `${task.effort === "L" ? "High" : task.effort === "M" ? "Moderate" : "Light"} workload`,
    STATUS_LABEL[task.status],
  ].join(" · ");

  return { task, score: Math.round(score), level, reasons, hoursLeft, summary };
}

export function rankAll(tasks: Task[], now: number): RankedTask[] {
  return tasks
    .map((t) => rankTask(t, now))
    .sort((a, b) => b.score - a.score || a.hoursLeft - b.hoursLeft);
}

export const LEVEL_STYLE: Record<PriorityLevel, { dot: string; text: string; chip: string }> = {
  Critical: {
    dot: "bg-crit",
    text: "text-crit",
    chip: "border-crit/40 bg-crit/12 text-crit",
  },
  High: {
    dot: "bg-teal",
    text: "text-teal",
    chip: "border-teal/40 bg-teal/12 text-teal",
  },
  Medium: {
    dot: "bg-slateblue",
    text: "text-slateblue",
    chip: "border-slateblue/40 bg-slateblue/12 text-slateblue",
  },
  Low: {
    dot: "bg-muted-foreground",
    text: "text-muted-foreground",
    chip: "border-border bg-muted/60 text-muted-foreground",
  },
};
