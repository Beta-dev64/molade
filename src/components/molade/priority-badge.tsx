import { LEVEL_STYLE } from "@/lib/molade/priority";
import type { PriorityLevel } from "@/lib/molade/types";
import { cn } from "@/lib/utils";

export function PriorityBadge({
  level,
  score,
  className,
}: {
  level: PriorityLevel;
  score?: number;
  className?: string;
}) {
  const s = LEVEL_STYLE[level];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase",
        s.chip,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} aria-hidden />
      {level}
      {score !== undefined && <span className="font-mono opacity-60">{score}</span>}
    </span>
  );
}
