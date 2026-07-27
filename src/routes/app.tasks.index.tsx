import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence } from "motion/react";
import { Plus, Search, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskRow } from "@/components/molade/task-row";
import { EmptyState } from "@/components/molade/empty-state";
import { TaskFormDialog } from "@/components/molade/task-form";
import { useMolade, useNow } from "@/store/molade-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/tasks/")({
  head: () => ({
    meta: [
      { title: "Tasks — Molade" },
      { name: "description", content: "Every coursework item, filterable by today, upcoming, overdue and completed." },
      { property: "og:title", content: "Tasks — Molade" },
      { property: "og:description", content: "Search, filter and complete your coursework in one calm list." },
    ],
  }),
  component: TasksPage,
});

const FILTERS = ["All", "Today", "Upcoming", "Overdue", "Completed"] as const;
const SORTS = ["Priority", "Deadline", "Created"] as const;

function TasksPage() {
  const { ranked, addTask, toggleComplete } = useMolade();
  const now = useNow();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const [sort, setSort] = useState<(typeof SORTS)[number]>("Priority");
  const [q, setQ] = useState("");
  const [creating, setCreating] = useState(false);

  const list = useMemo(() => {
    let out = ranked.filter((r) => {
      const done = r.task.status === "completed";
      if (filter === "Completed") return done;
      if (done) return false;
      if (filter === "Today") return r.hoursLeft >= 0 && r.hoursLeft <= 24;
      if (filter === "Upcoming") return r.hoursLeft > 24;
      if (filter === "Overdue") return r.hoursLeft < 0;
      return true;
    });
    if (q.trim()) {
      const s = q.toLowerCase();
      out = out.filter(
        (r) =>
          r.task.title.toLowerCase().includes(s) ||
          r.task.course.toLowerCase().includes(s) ||
          r.task.courseCode.toLowerCase().includes(s),
      );
    }
    const sorted = [...out];
    if (sort === "Deadline") sorted.sort((a, b) => a.hoursLeft - b.hoursLeft);
    if (sort === "Created")
      sorted.sort((a, b) => new Date(b.task.createdAt).getTime() - new Date(a.task.createdAt).getTime());
    return sorted;
  }, [ranked, filter, sort, q]);

  return (
    <div className="mx-auto max-w-5xl">
      <header className="rise grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <div className="min-w-0">
          <h1 className="text-[clamp(1.9rem,4vw,2.5rem)] leading-tight">Tasks</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {ranked.filter((r) => r.task.status !== "completed").length} open across your modules.
          </p>
        </div>
        <Button onClick={() => setCreating(true)} className="w-full sm:w-auto">
          <Plus className="size-4" /> New task
        </Button>
      </header>

      <div className="mt-8 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            aria-pressed={filter === f}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              filter === f
                ? "border-teal/50 bg-teal/15 text-teal"
                : "border-border text-muted-foreground hover:text-foreground",
            )}
          >
            {f}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <label className="text-[11px] tracking-wide text-muted-foreground uppercase" htmlFor="sort">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as (typeof SORTS)[number])}
            className="rounded-lg border border-border bg-surface/60 px-2.5 py-1.5 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {SORTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by title or module"
          className="pl-9"
          aria-label="Search tasks"
        />
      </div>

      {list.length ? (
        <ul className="mt-6">
          <AnimatePresence initial={false}>
            {list.map((r, i) => (
              <TaskRow key={r.task.id} ranked={r} now={now} index={i} onToggle={toggleComplete} />
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <EmptyState
          className="mt-10"
          icon={<ListChecks className="size-5" />}
          title={q ? "No matches" : `Nothing in ${filter.toLowerCase()}`}
          body={
            q
              ? "Try a different module code or a shorter search term."
              : "When something lands here, Molade will rank it against everything else you're carrying."
          }
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus className="size-4" /> Add a task
            </Button>
          }
        />
      )}

      <TaskFormDialog open={creating} onOpenChange={setCreating} onSave={(d) => addTask(d)} />
    </div>
  );
}
