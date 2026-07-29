import { useEffect, useState } from "react";
import { ArrowRight, Bell, ListChecks, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMolade } from "@/store/molade-store";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: Sparkles,
    title: "Start with “Next up”",
    body: "The dashboard opens with a single recommended task — the one Molade thinks deserves your next block of work. The strip at the top of every screen keeps it one tap away.",
  },
  {
    icon: ListChecks,
    title: "Open Priorities for the full queue",
    body: "Priorities lists every open task in scored order, with a bar showing how strongly each one pulls against the leader. Recalculate any time your week changes.",
  },
  {
    icon: Bell,
    title: "Understand — and adjust — the ranking",
    body: "Every task shows why it sits where it does: deadline proximity, workload against time left, status and overdue risk. Snooze a reminder and that task steps back down the ranking.",
  },
] as const;

export function OnboardingTour() {
  const { tourSeen, setTourSeen } = useMolade();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!tourSeen) setOpen(true);
  }, [tourSeen]);

  const finish = () => {
    setOpen(false);
    setStep(0);
    setTourSeen(true);
  };

  const current = STEPS[step];
  const Icon = current.icon;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) finish();
        else setOpen(true);
      }}
    >
      <DialogContent className="sm:max-w-md" aria-describedby="tour-body">
        <DialogHeader>
          <span
            aria-hidden="true"
            className="grid size-10 place-items-center rounded-xl border border-teal/40 bg-teal/12 text-teal"
          >
            <Icon className="size-5" />
          </span>
          <p className="eyebrow mt-4 text-teal">
            Step {step + 1} of {STEPS.length}
          </p>
          <DialogTitle className="mt-2 text-left font-display text-2xl leading-snug">
            {current.title}
          </DialogTitle>
          <DialogDescription id="tour-body" className="mt-2 text-left text-sm leading-relaxed">
            {current.body}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-1.5" role="presentation">
          {STEPS.map((s, i) => (
            <span
              key={s.title}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors",
                i <= step ? "bg-teal" : "bg-border",
              )}
            />
          ))}
        </div>
        <p aria-live="polite" className="sr-only">
          {`Walkthrough step ${step + 1} of ${STEPS.length}: ${current.title}`}
        </p>

        <DialogFooter className="mt-2 gap-2 sm:justify-between">
          <Button variant="ghost" onClick={finish} className="press">
            Skip walkthrough
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" className="press border-border" onClick={() => setStep((s) => s - 1)}>
                Back
              </Button>
            )}
            <Button
              className="press"
              onClick={() => (step === STEPS.length - 1 ? finish() : setStep((s) => s + 1))}
            >
              {step === STEPS.length - 1 ? "Start using Molade" : "Next"}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
