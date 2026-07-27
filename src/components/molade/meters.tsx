import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ProgressRing({
  value,
  size = 96,
  stroke = 8,
  label,
  sub,
  className,
}: {
  value: number;
  size?: number;
  stroke?: number;
  label?: string;
  sub?: string;
  className?: string;
}) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const id = window.setTimeout(() => setV(value), 80);
    return () => window.clearTimeout(id);
  }, [value]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  return (
    <div className={cn("relative inline-grid place-items-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--teal)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (c * v) / 100}
          style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-xl leading-none">{label ?? `${Math.round(value)}%`}</div>
        {sub && <div className="mt-1 text-[10px] tracking-wide text-muted-foreground uppercase">{sub}</div>}
      </div>
    </div>
  );
}

export function StatMeter({
  label,
  value,
  hint,
  percent,
}: {
  label: string;
  value: string;
  hint?: string;
  percent?: number;
}) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = window.setTimeout(() => setW(percent ?? 0), 100);
    return () => window.clearTimeout(id);
  }, [percent]);

  return (
    <div className="min-w-0">
      <div className="text-[11px] tracking-[0.12em] text-muted-foreground uppercase">{label}</div>
      <div className="font-display mt-1 text-3xl leading-none">{value}</div>
      {percent !== undefined && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full bg-teal"
            style={{ width: `${w}%`, transition: "width 1s cubic-bezier(0.22,1,0.36,1)" }}
          />
        </div>
      )}
      {hint && <div className="mt-2 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
