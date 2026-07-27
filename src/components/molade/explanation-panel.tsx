import { motion } from "motion/react";
import { CalendarClock, Gauge, CircleDot, ShieldAlert, Star } from "lucide-react";
import type { PriorityReason, RankedTask } from "@/lib/molade/types";

const ICONS = {
  deadline: CalendarClock,
  effort: Gauge,
  status: CircleDot,
  risk: ShieldAlert,
  preference: Star,
} as const;

export function ReasonChip({ reason }: { reason: PriorityReason }) {
  const Icon = ICONS[reason.kind];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface/70 px-2.5 py-1 text-xs text-muted-foreground">
      <Icon className="size-3.5 text-teal" aria-hidden />
      {reason.label}
    </span>
  );
}

export function ExplanationPanel({ ranked }: { ranked: RankedTask }) {
  const total = ranked.reasons.reduce((s, r) => s + Math.abs(r.weight), 0) || 1;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="overflow-hidden"
    >
      <div className="mt-3 rounded-xl border border-border bg-surface/60 p-4 sm:p-5">
        <p className="text-sm text-muted-foreground">
          Molade ranks with fixed rules — no black box. Each factor below adds or removes points
          from the score of <span className="font-mono text-foreground">{ranked.score}</span>.
        </p>
        <ul className="mt-4 space-y-3">
          {ranked.reasons.map((r) => {
            const Icon = ICONS[r.kind];
            const pct = (Math.abs(r.weight) / total) * 100;
            return (
              <li key={r.label + r.detail} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                <Icon className="size-4 shrink-0 text-teal" aria-hidden />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{r.label}</div>
                  <div className="truncate text-xs text-muted-foreground">{r.detail}</div>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-border">
                    <motion.div
                      className={r.weight < 0 ? "h-full rounded-full bg-muted-foreground" : "h-full rounded-full bg-teal"}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                </div>
                <span className="font-mono text-xs tabular-nums text-muted-foreground">
                  {r.weight > 0 ? "+" : ""}
                  {r.weight}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </motion.div>
  );
}
