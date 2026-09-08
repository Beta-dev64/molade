import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/molade/auth-shell";
import { MoladeOtpInput, formatOtpForApi } from "@/components/molade/otp-input";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { fetchAuthConfig, resendOtp, verifyEmail } from "@/lib/api/auth";

const searchSchema = z.object({
  email: z.string().email().optional().catch(undefined),
});

export const Route = createFileRoute("/verify-email")({
  validateSearch: searchSchema,
  loader: async () => {
    try {
      return await fetchAuthConfig();
    } catch {
      return { verificationMode: "" as const, verificationSkippable: false };
    }
  },
  head: () => ({
    meta: [
      { title: "Verify email — Molade" },
      { name: "description", content: "Enter the 6-character code we emailed you." },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { email: emailFromSearch } = Route.useSearch();
  const { verificationSkippable: skippable } = Route.useLoaderData();
  const [email] = useState(emailFromSearch ?? "");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const ready = useMemo(() => otp.replace(/[^A-Z0-9]/gi, "").length === 6, [otp]);

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !ready) return;
    setLoading(true);
    try {
      await verifyEmail(email, formatOtpForApi(otp));
      toast.success("Email verified");
      navigate({ to: "/app" });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    if (!email) return;
    setResending(true);
    try {
      await resendOtp(email, "EMAIL_VERIFY");
      toast.success("If eligible, a new code was sent");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Couldn't resend code");
    } finally {
      setResending(false);
    }
  }

  function onSkip() {
    toast.message("You can sign in without verifying for now");
    navigate({ to: "/login", search: { email } });
  }

  if (!email) {
    return (
      <AuthShell
        title="Verify your email"
        subtitle="Open this page from the link after registration, or sign in again."
      >
        <Button asChild className="w-full rounded-full">
          <Link to="/login">Back to sign in</Link>
        </Button>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Check your inbox"
      subtitle={`Enter the code we sent to ${email}. It expires in 10 minutes.`}
    >
      <form onSubmit={onVerify} className="space-y-8">
        <MoladeOtpInput value={otp} onChange={setOtp} disabled={loading} />
        <Button
          type="submit"
          size="lg"
          className="w-full rounded-full"
          disabled={!ready || loading}
        >
          {loading && <Loader2 className="size-4 animate-spin" />}
          Verify email
        </Button>
      </form>
      {skippable && (
        <Button
          type="button"
          variant="ghost"
          size="lg"
          className="mt-3 w-full rounded-full text-muted-foreground"
          onClick={onSkip}
        >
          Skip for now
        </Button>
      )}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <button
          type="button"
          className="text-teal hover:underline disabled:opacity-50"
          onClick={onResend}
          disabled={resending}
        >
          {resending ? "Sending…" : "Resend code"}
        </button>
        <Link to="/login" search={{ email }} className="hover:text-foreground">
          Back to sign in
        </Link>
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        {skippable
          ? "Verification is optional for now. You can sign in without the code."
          : "Unverified accounts are removed automatically after 24 hours."}
      </p>
    </AuthShell>
  );
}
