import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShieldCheck, Loader2 } from "lucide-react";
import heroImage from "@/assets/hero-atmosphere.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { login, register } from "@/lib/api/auth";
import { BrandMark } from "./app-shell";
import { cn } from "@/lib/utils";

export interface AuthField {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  autoComplete?: string;
}

export function AuthLayout({
  mode,
  title,
  subtitle,
  fields,
  submitLabel,
  footer,
}: {
  mode: "login" | "register";
  title: string;
  subtitle: string;
  fields: AuthField[];
  submitLabel: string;
  footer: React.ReactNode;
}) {
  const navigate = useNavigate();
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  function validate(all = false) {
    const next: Record<string, string> = {};
    for (const f of fields) {
      const v = (values[f.name] ?? "").trim();
      if (!all && !touched[f.name]) continue;
      if (!v) next[f.name] = `${f.label} is required.`;
      else if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))
        next[f.name] = "Enter a valid email address.";
      else if (f.name === "password" && v.length < 8)
        next[f.name] = "Use at least 8 characters.";
      else if (f.name === "confirm" && v !== (values.password ?? ""))
        next[f.name] = "Passwords do not match.";
    }
    setErrors(next);
    return next;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(Object.fromEntries(fields.map((f) => [f.name, true])));
    const errs = validate(true);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      if (mode === "login") {
        await login(values.email!.trim(), values.password!);
        toast.success("Welcome back");
        navigate({ to: "/app" });
      } else {
        const result = await register({
          name: values.name!.trim(),
          email: values.email!.trim(),
          password: values.password!,
        });
        toast.success("Account created", {
          description: "Check your email for a verification code.",
        });
        navigate({
          to: "/verify-email",
          search: { email: result.email },
        });
      }
    } catch (err) {
      if (err instanceof ApiError && err.code === "EMAIL_NOT_VERIFIED") {
        toast.error("Verify your email first", {
          description: "We can resend a code on the next screen.",
        });
        navigate({
          to: "/verify-email",
          search: { email: values.email!.trim() },
        });
      } else {
        toast.error(err instanceof ApiError ? err.message : "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="atmosphere grain grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="relative hidden overflow-hidden border-r border-border/60 lg:block">
        <img src={heroImage} alt="" aria-hidden className="absolute inset-0 size-full object-cover opacity-60" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--background) 40%, transparent), color-mix(in oklab, var(--background) 90%, transparent))",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <BrandMark />
          <div>
            <h2 className="max-w-md text-[clamp(2rem,3.4vw,3rem)] leading-[1.05]">
              Know what matters next.
            </h2>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Coursework, exams and personal deadlines — ranked automatically, explained clearly.
            </p>
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 text-teal" />
            Built for academic use. Your data is used only to run the app.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <h1 className="font-display mt-8 text-4xl lg:mt-0">{title}</h1>
          <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>

          <form onSubmit={submit} className="mt-9 space-y-5" noValidate>
            {fields.map((f) => (
              <div key={f.name} className="space-y-2">
                <Label htmlFor={f.name} className="text-xs tracking-[0.1em] text-muted-foreground uppercase">
                  {f.label}
                </Label>
                <Input
                  id={f.name}
                  type={f.type}
                  autoComplete={f.autoComplete}
                  placeholder={f.placeholder}
                  value={values[f.name] ?? ""}
                  aria-invalid={!!errors[f.name]}
                  aria-describedby={errors[f.name] ? `${f.name}-err` : undefined}
                  onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.value }))}
                  onBlur={() => {
                    setTouched((t) => ({ ...t, [f.name]: true }));
                    window.setTimeout(() => validate(), 0);
                  }}
                  className={cn(errors[f.name] && "border-crit focus-visible:ring-crit/40")}
                />
                {errors[f.name] && (
                  <p id={`${f.name}-err`} className="text-xs text-crit">
                    {errors[f.name]}
                  </p>
                )}
              </div>
            ))}

            {mode === "login" && (
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-teal hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {submitLabel}
            </Button>
          </form>

          <p className="mt-8 text-sm text-muted-foreground">{footer}</p>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground/80">
            Molade stores your coursework only to schedule reminders and rank your tasks. No
            profiling, no selling of data — UK GDPR friendly by design.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AuthSwitchLink({
  to,
  prompt,
  label,
}: {
  to: "/login" | "/register";
  prompt: string;
  label: string;
}) {
  return (
    <>
      {prompt}{" "}
      <Link to={to} className="font-semibold text-teal hover:underline">
        {label}
      </Link>
    </>
  );
}
