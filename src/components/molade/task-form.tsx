import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { Task } from "@/lib/molade/types";
import { EFFORT_LABEL, STATUS_LABEL } from "@/lib/molade/priority";
import { cn } from "@/lib/utils";

const EFFORTS: Task["effort"][] = ["S", "M", "L"];
const STATUSES: Task["status"][] = ["not_started", "in_progress", "blocked", "completed"];
const PREFS: Task["personalPreference"][] = ["low", "normal", "high"];

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export interface TaskDraft {
  title: string;
  description: string;
  course: string;
  courseCode: string;
  deadline: string;
  effort: Task["effort"];
  status: Task["status"];
  personalPreference: Task["personalPreference"];
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  onSave,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task?: Task;
  onSave: (draft: TaskDraft) => void;
}) {
  const [draft, setDraft] = useState<TaskDraft>(() => blank());
  const [errors, setErrors] = useState<Record<string, string>>({});

  function blank(): TaskDraft {
    const d = new Date(Date.now() + 48 * 36e5);
    return {
      title: "",
      description: "",
      course: "",
      courseCode: "",
      deadline: toLocalInput(d.toISOString()),
      effort: "M",
      status: "not_started",
      personalPreference: "normal",
    };
  }

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setDraft(
      task
        ? {
            title: task.title,
            description: task.description,
            course: task.course,
            courseCode: task.courseCode,
            deadline: toLocalInput(task.deadline),
            effort: task.effort,
            status: task.status,
            personalPreference: task.personalPreference,
          }
        : blank(),
    );
  }, [open, task]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (draft.title.trim().length < 3) next.title = "Give the task a clear title (3+ characters).";
    if (!draft.courseCode.trim()) next.courseCode = "Add a module code, e.g. COM814.";
    if (!draft.deadline) next.deadline = "A deadline is required for ranking.";
    setErrors(next);
    if (Object.keys(next).length) return;
    onSave({ ...draft, deadline: new Date(draft.deadline).toISOString() });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {task ? "Edit task" : "New task"}
          </DialogTitle>
          <DialogDescription>
            Deadline, effort and status feed the ranking. Everything else is for you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-5" noValidate>
          <Field label="Title" error={errors.title} htmlFor="t-title">
            <Input
              id="t-title"
              autoFocus
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Dissertation Draft — Chapter 3"
              aria-invalid={!!errors.title}
            />
          </Field>

          <Field label="Description" htmlFor="t-desc">
            <Textarea
              id="t-desc"
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="What exactly has to be delivered?"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Course / module" htmlFor="t-course">
              <Input
                id="t-course"
                value={draft.course}
                onChange={(e) => setDraft({ ...draft, course: e.target.value })}
                placeholder="Human–Computer Interaction"
              />
            </Field>
            <Field label="Module code" error={errors.courseCode} htmlFor="t-code">
              <Input
                id="t-code"
                value={draft.courseCode}
                onChange={(e) => setDraft({ ...draft, courseCode: e.target.value.toUpperCase() })}
                placeholder="COM723"
                aria-invalid={!!errors.courseCode}
              />
            </Field>
          </div>

          <Field label="Deadline" error={errors.deadline} htmlFor="t-deadline">
            <Input
              id="t-deadline"
              type="datetime-local"
              value={draft.deadline}
              onChange={(e) => setDraft({ ...draft, deadline: e.target.value })}
              aria-invalid={!!errors.deadline}
            />
          </Field>

          <Field label="Estimated effort">
            <div className="flex flex-wrap gap-2">
              {EFFORTS.map((e) => (
                <Chip key={e} active={draft.effort === e} onClick={() => setDraft({ ...draft, effort: e })}>
                  {EFFORT_LABEL[e]}
                </Chip>
              ))}
            </div>
          </Field>

          <Field label="Status">
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <Chip key={s} active={draft.status === s} onClick={() => setDraft({ ...draft, status: s })}>
                  {STATUS_LABEL[s]}
                </Chip>
              ))}
            </div>
          </Field>

          <Field
            label="Personal priority preference"
            hint="A nudge only — Molade still ranks by deadline, workload and status."
          >
            <div className="flex flex-wrap gap-2">
              {PREFS.map((p) => (
                <Chip
                  key={p}
                  active={draft.personalPreference === p}
                  onClick={() => setDraft({ ...draft, personalPreference: p })}
                >
                  {p[0].toUpperCase() + p.slice(1)}
                </Chip>
              ))}
            </div>
          </Field>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{task ? "Save changes" : "Create task"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor} className="text-xs tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-crit">{error}</p>}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-full border px-3 py-1.5 text-xs font-medium transition-all focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        active
          ? "border-teal/50 bg-teal/15 text-teal"
          : "border-border text-muted-foreground hover:border-teal/40 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
