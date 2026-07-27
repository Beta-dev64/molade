import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Flame } from "lucide-react";
import { ProgressRing, StatMeter } from "@/components/molade/meters";
import { useMolade, useNow } from "@/store/molade-store";
import { COMPLETION_TREND, ONTIME_SPLIT } from "@/lib/molade/mock-data";
import { EFFORT_HOURS } from "@/lib/molade/priority";

export const Route = createFileRoute("/app/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — Molade" },
      { name: "description", content: "Completion trends, on-time rate, workload by module and your consistency streak." },
      { property: "og:title", content: "Analytics — Molade" },
      { property: "og:description", content: "See how your semester is actually going." },
    ],
  }),
  component: Analytics,
});

export function Analytics() {
  const { tasks } = useMolade();
  const now = useNow();

  const byCourse = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of tasks) {
      if (t.status === "completed") continue;
      map.set(t.courseCode, (map.get(t.courseCode) ?? 0) + EFFORT_HOURS[t.effort]);
    }
    return [...map.entries()].map(([code, hours]) => ({ code, hours })).sort((a, b) => b.hours - a.hours);
  }, [tasks]);
  const maxHours = Math.max(...byCourse.map((c) => c.hours), 1);

  const completed = tasks.filter((t) => t.status === "completed");
  const onTime = completed.filter((t) => t.completedOnTime).length;
  const rate = Math.round((onTime / Math.max(completed.length, 1)) * 100);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="rise">
        <h1 className="text-[clamp(1.9rem,4vw,2.5rem)] leading-tight">Analytics</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Six weeks of coursework behaviour — enough to see a pattern, not enough to obsess over.
        </p>
      </header>

      <section className="mt-10 grid gap-10 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:gap-14">
        <ProgressRing value={rate} sub="On time" />
        <div className="grid gap-8 sm:grid-cols-3">
          <StatMeter label="Completed" value={String(completed.length)} percent={Math.min(100, completed.length * 12)} hint="This semester" />
          <StatMeter label="Late submissions" value={String(completed.length - onTime)} percent={(completed.length - onTime) * 20} hint="Down from last month" />
          <StatMeter label="Avg. lead time" value="1.6d" percent={64} hint="Finished before deadline" />
        </div>
      </section>

      <section className="mt-14 border-t border-border/60 pt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl">Completion trend</h2>
          <p className="text-xs text-muted-foreground">Tasks completed vs planned, weekly</p>
        </div>
        <div className="mt-6 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={COMPLETION_TREND} margin={{ left: -20, right: 8, top: 8 }}>
              <defs>
                <linearGradient id="grad-completed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--teal)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--teal)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" vertical={false} />
              <XAxis dataKey="week" stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis stroke="var(--muted-foreground)" tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey="planned" stroke="var(--slateblue)" strokeDasharray="4 4" fill="none" />
              <Area type="monotone" dataKey="completed" stroke="var(--teal)" strokeWidth={2} fill="url(#grad-completed)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mt-14 grid gap-12 border-t border-border/60 pt-10 lg:grid-cols-2">
        <div>
          <h2 className="text-xl">On time vs late</h2>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={ONTIME_SPLIT} dataKey="value" innerRadius={58} outerRadius={84} paddingAngle={3} stroke="none">
                  {ONTIME_SPLIT.map((entry, i) => (
                    <Cell key={entry.name} fill={i === 0 ? "var(--teal)" : "var(--amber)"} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-teal" /> On time · 23
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="size-2 rounded-full bg-amber" /> Late · 5
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-xl">Workload by module</h2>
          <ul className="mt-6 space-y-4">
            {byCourse.map((c) => (
              <li key={c.code} className="grid grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center gap-3">
                <span className="font-mono text-xs text-muted-foreground">{c.code}</span>
                <div className="h-1.5 overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-teal"
                    style={{ width: `${(c.hours / maxHours) * 100}%`, transition: "width 1s cubic-bezier(0.22,1,0.36,1)" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground tabular-nums">{c.hours}h</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-14 flex flex-wrap items-center gap-6 border-t border-border/60 pt-10">
        <div className="grid size-14 shrink-0 place-items-center rounded-full border border-amber/40 bg-amber/12 text-amber">
          <Flame className="size-6" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-2xl">11-day streak</p>
          <p className="mt-1 text-sm text-muted-foreground">
            You’ve completed at least one task every day since {new Date(now - 11 * 864e5).toLocaleDateString(undefined, { month: "long", day: "numeric" })}.
          </p>
        </div>
      </section>
    </div>
  );
}
