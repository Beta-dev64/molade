import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/molade/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { forgotPassword } from "@/lib/api/auth";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot password — Molade" },
      { name: "description", content: "Request a one-time code to reset your Molade password." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      toast.success("If an account exists, a reset code was sent");
      navigate({ to: "/reset-password", search: { email: email.trim() } });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll email a 6-character code if that address has a Molade account."
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="fp-email" className="text-xs tracking-[0.1em] text-muted-foreground uppercase">
            University email
          </Label>
          <Input
            id="fp-email"
            type="email"
            autoComplete="email"
            placeholder="you@ulster.ac.uk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" size="lg" className="w-full rounded-full" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          Send reset code
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link to="/login" className="font-semibold text-teal hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
