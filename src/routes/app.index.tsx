import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Plus, Sparkles, CheckCircle2, PenLine, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PriorityBadge } from "@/components/molade/priority-badge";
import { DeadlineCountdown } from "@/components/molade/deadline-countdown";
import { ExplanationPanel } from "@/components/molade/explanation-panel";
import { ProgressRing, StatMeter } from "@/components/molade/meters";
import { TaskRow } from "@/components/molade/task-row";
import { EmptyState } from "@/components/molade/empty-state";
import { useMolade, useNow } from "@/store/molade-store";
import { EFFORT_HOURS } from "@/lib/molade/priority";

export const Route = createFileRoute("/app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Molade" },
      { name: "description", content: "What to do next, right now: your top-ranked task with the reasoning behind it." },
      { property: "og:title", content: "Dashboard — Molade" },
      { property: "og:description", content: "Your academic focus for today, ranked and explained." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { ranked, tasks, activity, addTask, toggleComplete } = useMolade();
  const now = useNow();
  const [showWhy, setShowWhy] = useState(false);
  const [quick, setQuick] = useState("");

  const open = ranked.filter((r) => r.task.status !== "completed");
  const nextUp = open[0];
  const top5 = open.slice(0, 5);

  const completion = Math.round(
    (tasks.filter((t) => t.status === "completed").length / Math.max(tasks.length, 1)) * 100,
  );
  const dueThisWeek = open.filter((r) => r.hoursLeft > 0 && r.hoursLeft <= 168).length;
  const overdue = open.filter((r) => r.hoursLeft < 0).length;

  const heat = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => ({ i, hours: 0, label: "" }));
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    for (const r of open) {
      const idx = Math.floor((new Date(r.task.deadline).getTime() - start.getTime()) / 864e5);
      if (idx >= 0 && idx < 14) days[idx].hours += EFFORT_HOURS[r.task.effort];
      else if (idx < 0) days[0].hours += EFFORT_HOURS[r.task.effort];
    }
    return days.map((d) => ({
      ...d,
      label: new Date(start.getTime() + d.i * 864e5).toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
      }),
    }));
  }, [open, now]);
  const maxHeat = Math.max(...heat.map((d) => d.hours), 1);

  const hour = new Date(now).getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-5xl">
      <header className="rise">
        <h1 className="text-[clamp(1.9rem,4vw,2.75rem)] leading-tight">{greeting}, Adeola.</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {overdue > 0 ? `${overdue} task${overdue > 1 ? "s" : ""} overdue · ` : ""}
          {dueThisWeek} due this week · Dissertation work should own your next block.
        </p>
      </header>

      {/* NEXT UP */}
      {nextUp ? (
        <section className="rise mt-10" style={{ animationDelay: "0.08s" }}>
          <p className="font-mono text-[11px] tracking-[0.25em] text-teal uppercase">Next up</p>
          <div className="mt-4 rounded-2xl border border-border bg-surface/50 p-5 sm:p-7">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4">
              <div className="min-w-0">
                <Link
                  to="/app/tasks/$taskId"
                  params={{ taskId: nextUp.task.id }}
                  className="font-display text-2xl leading-snug hover:text-teal sm:text-3xl"
                >
                  {nextUp.task.title}
                </Link>
                <p className="mt-2 text-sm text-muted-foreground">{nextUp.summary}</p>
              </div>
              <PriorityBadge level={nextUp.level} score={nextUp.score} />
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button size="sm" onClick={() => toggleComplete(nextUp.task.id)}>
                <CheckCircle2 className="size-4" /> Mark complete
              </Button>
              <Button size="sm" variant="outline" className="border-border" onClick={() => setShowWhy((v) => !v)}>
                <Sparkles className="size-4" /> {showWhy ? "Hide reasoning" : "Why this task?"}
              </Button>
              <DeadlineCountdown deadline={nextUp.task.deadline} now={now} className="ml-auto" />
            </div>
            <AnimatePresence initial={false}>{showWhy && <ExplanationPanel ranked={nextUp} />}</AnimatePresence>
          </div>
        </section>
      ) : (
        <EmptyState
          className="mt-10"
          icon={<CheckCircle2 className="size-5" />}
          title="Everything is done"
          body="No open tasks left in this semester view. Add the next one when it lands."
        />
      )}

      {/* PROGRESS */}
      <section className="mt-14 grid gap-10 border-t border-border/60 pt-10 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-14">
        <ProgressRing value={completion} sub="Complete" />
        <div className="grid gap-8 sm:grid-cols-3">
          <StatMeter label="Due this week" value={String(dueThisWeek)} percent={Math.min(100, dueThisWeek * 20)} hint="Across all modules" />
          <StatMeter label="Overdue" value={String(overdue)} percent={overdue * 33} hint="Ranked to the top" />
          <StatMeter label="Open tasks" value={String(open.length)} percent={Math.min(100, open.length * 12)} hint="Currently tracked" />
        </div>
      </section>

      {/* WORKLOAD HEAT */}
      <section className="mt-14 border-t border-border/60 pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl">Workload ahead</h2>
          <p className="text-xs text-muted-foreground">Estimated hours landing per day · next 14 days</p>
        </div>
        <div className="mt-6 grid grid-cols-7 gap-1.5 sm:grid-cols-14">
          {heat.map((d, i) => {
            const ratio = d.hours / maxHeat;
            return (
              <div key={d.i} className="group relative">
                <motion.div
                  initial={{ height: 6, opacity: 0 }}
                  animate={{ height: 8 + ratio * 64, opacity: 1 }}
                  transition={{ duration: 0.6, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  className="w-full rounded-md"
                  style={{
                    background:
                      d.hours === 0
                        ? "var(--border)"
                        : ratio > 0.66
                          ? "var(--amber)"
                          : ratio > 0.33
                            ? "var(--teal)"
                            : "color-mix(in oklab, var(--teal) 45%, transparent)",
                  }}
                />
                <span className="mt-2 block truncate text-[9px] text-muted-foreground">{d.label.split(" ")[0]}</span>
                <span className="pointer-events-none absolute -top-8 left-1/2 z-10 -translate-x-1/2 rounded-md border border-border bg-popover px-2 py-1 text-[10px] whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                  {d.label} · {d.hours}h
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* QUICK ADD + TOP 5 */}
      <section className="mt-14 border-t border-border/60 pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-xl">Top priorities</h2>
          <Link to="/app/priorities" className="inline-flex items-center gap-1 text-sm text-teal hover:underline">
            Full ranking <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <form
          className="mt-5 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (quick.trim().length < 3) return;
            addTask({
              title: quick.trim(),
              description: "",
              course: "Unassigned",
              courseCode: "GEN",
              deadline: new Date(Date.now() + 72 * 36e5).toISOString(),
              effort: "M",
              status: "not_started",
              personalPreference: "normal",
            });
            setQuick("");
          }}
        >
          <Input
            value={quick}
            onChange={(e) => setQuick(e.target.value)}
            placeholder="Quick add a task — defaults to 3 days out, medium effort"
            aria-label="Quick add task"
          />
          <Button type="submit" size="icon" aria-label="Add task">
            <Plus className="size-4" />
          </Button>
        </form>

        <ul className="mt-4">
          {top5.map((r, i) => (
            <TaskRow key={r.task.id} ranked={r} now={now} index={i} onToggle={toggleComplete} showRank />
          ))}
        </ul>
      </section>

      {/* ACTIVITY */}
      <section className="mt-14 border-t border-border/60 pt-10">
        <h2 className="text-xl">Recent activity</h2>
        <ul className="mt-5 space-y-4">
          {activity.slice(0, 5).map((a) => {
            const Icon =
              a.kind === "completed" ? CheckCircle2 : a.kind === "reminder" ? Bell : a.kind === "created" ? Plus : PenLine;
            return (
              <li key={a.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 text-sm">
                <Icon className="size-4 shrink-0 text-teal" />
                <span className="truncate">{a.text}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(a.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
