import type { ReactNode } from "react";
import { BrandMark } from "./app-shell";

/** Compact auth page chrome for OTP / forgot-password flows. */
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="atmosphere grain flex min-h-screen items-center justify-center px-5 py-16">
      <div className="w-full max-w-md">
        <BrandMark />
        <h1 className="font-display mt-8 text-4xl">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-9">{children}</div>
      </div>
    </div>
  );
}
