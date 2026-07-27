import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle2, PenLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PriorityBadge } from "@/components/molade/priority-badge";
import { DeadlineCountdown } from "@/components/molade/deadline-countdown";
import { ExplanationPanel } from "@/components/molade/explanation-panel";
import { TaskFormDialog } from "@/components/molade/task-form";
import { EmptyState } from "@/components/molade/empty-state";
import { useMolade, useNow } from "@/store/molade-store";
import { EFFORT_LABEL, STATUS_LABEL } from "@/lib/molade/priority";

export const Route = createFileRoute("/app/tasks/$taskId")({
  head: () => ({
    meta: [
      { title: "Task detail — Molade" },
      { name: "description", content: "Full task detail with deadline, effort, status and the exact reasoning behind its rank." },
    ],
  }),
  component: TaskDetail,
});

function TaskDetail() {
  const { taskId } = Route.useParams();
  const { ranked, toggleComplete, updateTask, deleteTask } = useMolade();
  const now = useNow();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const item = ranked.find((r) => r.task.id === taskId);

  if (!item) {
    return (
      <EmptyState
        title="Task not found"
        body="This task may have been deleted. Head back to your list to keep going."
        action={
          <Button asChild>
            <Link to="/app/tasks">Back to tasks</Link>
          </Button>
        }
      />
    );
  }

  const { task } = item;
  const done = task.status === "completed";

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/app/tasks" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All tasks
      </Link>

      <header className="rise mt-6">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-md border border-border px-2 py-1 font-mono text-[10px] tracking-wide text-muted-foreground">
            {task.courseCode}
          </span>
          <PriorityBadge level={item.level} score={item.score} />
          <DeadlineCountdown deadline={task.deadline} now={now} completed={done} />
        </div>
        <h1 className="mt-4 text-[clamp(1.8rem,4vw,2.6rem)] leading-tight">{task.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {task.description || "No description yet."}
        </p>
      </header>

      <dl className="mt-10 grid gap-6 border-y border-border/60 py-8 sm:grid-cols-4">
        {[
          ["Module", task.course || "—"],
          ["Deadline", new Date(task.deadline).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })],
          ["Effort", EFFORT_LABEL[task.effort]],
          ["Status", STATUS_LABEL[task.status]],
        ].map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{k}</dt>
            <dd className="mt-1.5 text-sm">{v}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button onClick={() => toggleComplete(task.id)}>
          <CheckCircle2 className="size-4" /> {done ? "Reopen task" : "Mark complete"}
        </Button>
        <Button variant="outline" className="border-border" onClick={() => setEditing(true)}>
          <PenLine className="size-4" /> Edit
        </Button>
        <Button
          variant="ghost"
          className="text-crit hover:text-crit"
          onClick={() => {
            deleteTask(task.id);
            navigate({ to: "/app/tasks" });
          }}
        >
          <Trash2 className="size-4" /> Delete
        </Button>
      </div>

      <section className="mt-12">
        <h2 className="text-xl">Why this ranking?</h2>
        <ExplanationPanel ranked={item} />
      </section>

      <TaskFormDialog
        open={editing}
        onOpenChange={setEditing}
        task={task}
        onSave={(d) => updateTask(task.id, d)}
      />
    </div>
  );
}
