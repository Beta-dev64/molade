import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { RefreshCw, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/molade/priority-badge";
import { DeadlineCountdown } from "@/components/molade/deadline-countdown";
import { ExplanationPanel, ReasonChip } from "@/components/molade/explanation-panel";
import { EmptyState } from "@/components/molade/empty-state";
import { useMolade, useNow } from "@/store/molade-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/priorities")({
  head: () => ({
    meta: [
      { title: "Priorities — Molade" },
      { name: "description", content: "A ranked queue of your coursework with the exact reasons behind every position." },
      { property: "og:title", content: "Priorities — Molade" },
      { property: "og:description", content: "Rule-based, transparent prioritisation. No black box." },
    ],
  }),
  component: Priorities,
});

function Priorities() {
  const { ranked, recalculate, recalculating } = useMolade();
  const now = useNow();
  const [openId, setOpenId] = useState<string | null>(null);

  const open = ranked.filter((r) => r.task.status !== "completed");

  return (
    <div className="mx-auto max-w-4xl">
      <header className="rise grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <h1 className="text-[clamp(1.9rem,4vw,2.5rem)] leading-tight">Priorities</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Ranked by fixed rules — deadline proximity, workload against time left, status and
            overdue risk. Every position is explainable, and nothing is hidden behind a model.
          </p>
        </div>
        <Button onClick={recalculate} disabled={recalculating} className="w-full sm:w-auto">
          <RefreshCw className={cn("size-4", recalculating && "animate-spin")} />
          Recalculate priorities
        </Button>
      </header>

      {open.length === 0 ? (
        <EmptyState
          className="mt-10"
          icon={<Sparkles className="size-5" />}
          title="Nothing to rank"
          body="Add a task with a deadline and it will appear here, scored against everything else."
        />
      ) : (
        <ul className="mt-10">
          {open.map((r, i) => {
            const isOpen = openId === r.task.id;
            const top = [...r.reasons].sort((a, b) => (b.weight ?? 0) - (a.weight ?? 0))[0];
            const share = Math.max(6, Math.round((r.score / (open[0]?.score || r.score || 1)) * 100));
            return (
              <motion.li
                key={r.task.id}
                layout
                transition={{ layout: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } }}
                className={cn(
                  "border-b border-border/60 py-6 transition-colors",
                  i === 0 && "rounded-2xl border-b-0 border border-teal/35 bg-teal/6 p-6",
                )}
              >
                <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-4">
                  <span className="font-display text-2xl leading-none text-muted-foreground tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <Link
                      to="/app/tasks/$taskId"
                      params={{ taskId: r.task.id }}
                      className="text-base font-semibold hover:text-teal"
                    >
                      {r.task.title}
                    </Link>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span className="font-mono text-[10px] text-muted-foreground">{r.task.courseCode}</span>
                      <DeadlineCountdown deadline={r.task.deadline} now={now} />
                    </div>

                    {top && (
                      <p className="mt-3 text-xs text-muted-foreground">
                        Ranked here mainly because{" "}
                        <span className="text-foreground">{top.label.toLowerCase()}</span>
                        {top.detail ? ` — ${top.detail.toLowerCase()}` : ""}.
                      </p>
                    )}

                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-border/70">
                      <motion.div
                        layout
                        initial={{ width: 0 }}
                        animate={{ width: `${share}%` }}
                        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                        className={cn("h-full rounded-full", i === 0 ? "bg-teal" : "bg-teal/45")}
                      />
                    </div>

                    <button
                      onClick={() => setOpenId(isOpen ? null : r.task.id)}
                      aria-expanded={isOpen}
                      className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-teal hover:underline"
                    >
                      {isOpen ? "Hide the reasoning" : "Why this ranking?"}
                      <ChevronDown className={cn("size-3.5 transition-transform", isOpen && "rotate-180")} />
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <div>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {r.reasons.map((reason) => (
                              <ReasonChip key={reason.label} reason={reason} />
                            ))}
                          </div>
                          <ExplanationPanel ranked={r} />
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                  <PriorityBadge level={r.level} score={r.score} />
                </div>
              </motion.li>
            );
          })}
        </ul>

      )}

      <p className="mt-10 rounded-xl border border-border bg-surface/40 p-5 text-xs leading-relaxed text-muted-foreground">
        <strong className="font-semibold text-foreground">How scoring works.</strong> Each task
        starts at zero. Deadline proximity contributes up to 46 points, workload pressure up to 24,
        status up to 14, and overdue risk up to 18. Your own preference nudges by ±6 — it never
        overrides the schedule. Totals above 78 are Critical, 60 High, 42 Medium.
      </p>
    </div>
  );
}
