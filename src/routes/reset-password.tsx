import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/molade/auth-shell";
import { MoladeOtpInput, formatOtpForApi } from "@/components/molade/otp-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { resetPassword, verifyResetOtp } from "@/lib/api/auth";

const searchSchema = z.object({
  email: z.string().email().optional().catch(undefined),
});

export const Route = createFileRoute("/reset-password")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Reset password — Molade" },
      { name: "description", content: "Enter your reset code and choose a new password." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const { email: emailFromSearch } = Route.useSearch();
  const [email] = useState(emailFromSearch ?? "");
  const [step, setStep] = useState<"otp" | "password">("otp");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const ready = useMemo(() => otp.replace(/[^A-Z0-9]/gi, "").length === 6, [otp]);

  async function onVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !ready) return;
    setLoading(true);
    try {
      const data = await verifyResetOtp(email, formatOtpForApi(otp));
      setResetToken(data.resetToken);
      setStep("password");
      toast.success("Code accepted");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Use at least 8 characters");
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(resetToken, password);
      toast.success("Password updated — you can sign in");
      navigate({ to: "/login" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't reset password");
    } finally {
      setLoading(false);
    }
  }

  if (!email) {
    return (
      <AuthShell title="Reset password" subtitle="Start from the forgot-password page.">
        <Button asChild className="w-full rounded-full">
          <Link to="/forgot-password">Request a code</Link>
        </Button>
      </AuthShell>
    );
  }

  if (step === "otp") {
    return (
      <AuthShell
        title="Enter your code"
        subtitle={`We sent a reset code to ${email}. It expires in 10 minutes.`}
      >
        <form onSubmit={onVerifyOtp} className="space-y-8">
          <MoladeOtpInput value={otp} onChange={setOtp} disabled={loading} />
          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full"
            disabled={!ready || loading}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            Continue
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted-foreground">
          <Link to="/forgot-password" className="text-teal hover:underline">
            Resend from the start
          </Link>
        </p>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="Choose a new password" subtitle="Use at least 8 characters.">
      <form onSubmit={onReset} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="np" className="text-xs tracking-[0.1em] text-muted-foreground uppercase">
            New password
          </Label>
          <Input
            id="np"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="npc" className="text-xs tracking-[0.1em] text-muted-foreground uppercase">
            Confirm password
          </Label>
          <Input
            id="npc"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </div>
        <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Update password
        </Button>
      </form>
    </AuthShell>
  );
}
