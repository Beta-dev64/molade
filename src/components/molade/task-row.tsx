import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { motion } from "motion/react";
import { PriorityBadge } from "./priority-badge";
import { DeadlineCountdown } from "./deadline-countdown";
import type { RankedTask } from "@/lib/molade/types";
import { STATUS_LABEL } from "@/lib/molade/priority";
import { cn } from "@/lib/utils";

export function TaskRow({
  ranked,
  now,
  onToggle,
  index = 0,
  showRank,
}: {
  ranked: RankedTask;
  now: number;
  onToggle: (id: string) => void;
  index?: number;
  showRank?: boolean;
}) {
  const { task, level, score, summary } = ranked;
  const done = task.status === "completed";

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.03, 0.25), layout: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
      className="group relative"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-xl border border-transparent px-3 py-4 transition-colors hover:border-border hover:bg-surface/60 sm:gap-4 sm:px-4">
        <button
          type="button"
          onClick={() => onToggle(task.id)}
          aria-label={done ? `Reopen ${task.title}` : `Complete ${task.title}`}
          aria-pressed={done}
          className={cn(
            "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border transition-all duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            done
              ? "scale-100 border-emerald bg-emerald text-background"
              : "border-border hover:scale-110 hover:border-teal",
          )}
        >
          <Check className={cn("size-3.5 transition-transform", done ? "scale-100" : "scale-0")} />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {showRank && (
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
            )}
            <Link
              to="/app/tasks/$taskId"
              params={{ taskId: task.id }}
              className={cn(
                "truncate text-[15px] font-semibold transition-colors hover:text-teal",
                done && "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </Link>
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="rounded-md border border-border/70 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-muted-foreground">
              {task.courseCode}
            </span>
            <DeadlineCountdown deadline={task.deadline} now={now} completed={done} />
            <span className="text-xs text-muted-foreground">{STATUS_LABEL[task.status]}</span>
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground/80">{summary}</p>
        </div>

        <PriorityBadge level={level} score={score} className="mt-0.5" />
      </div>
      <div className="mx-3 h-px bg-border/60 sm:mx-4" />
    </motion.li>
  );
}
