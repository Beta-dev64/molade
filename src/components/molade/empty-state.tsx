import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  icon,
  title,
  body,
  action,
  steps,
  className,
  compact,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
  /** Optional "what to do next" prompts rendered as a numbered list. */
  steps?: string[];
  className?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-2xl border border-border/70 bg-surface/40 text-center",
        compact ? "px-5 py-8 sm:px-6 sm:py-10" : "px-6 py-12 sm:px-10 sm:py-16",
        className,
      )}
    >
      {/* soft brand bloom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-24 -z-10 h-48 opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(28rem 12rem at 50% 50%, color-mix(in oklab, var(--teal) 22%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto flex max-w-md flex-col items-center">
        {icon && (
          <div className="mb-5 grid size-12 place-items-center rounded-2xl border border-teal/30 bg-teal/10 text-teal shadow-[0_16px_40px_-24px_var(--teal)]">
            {icon}
          </div>
        )}
        <h3 className={cn("font-display tracking-tight", compact ? "text-lg" : "text-xl sm:text-2xl")}>{title}</h3>
        <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{body}</p>

        {steps && steps.length > 0 && (
          <ol className="mt-6 grid w-full gap-2 text-left">
            {steps.map((s, i) => (
              <li
                key={s}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 rounded-xl border border-border/60 bg-background/40 px-3.5 py-2.5 text-sm"
              >
                <span className="mt-px grid size-5 shrink-0 place-items-center rounded-full bg-teal/15 font-mono text-[10px] text-teal">
                  {i + 1}
                </span>
                <span className="min-w-0 text-muted-foreground">{s}</span>
              </li>
            ))}
          </ol>
        )}

        {action && <div className="mt-7 flex flex-wrap justify-center gap-2">{action}</div>}
      </div>
    </div>
  );
}
