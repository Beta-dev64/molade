import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AuthLayout, AuthSwitchLink } from "@/components/molade/auth-layout";

const searchSchema = z.object({
  email: z.string().email().optional().catch(undefined),
});

export const Route = createFileRoute("/login")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — Molade" },
      { name: "description", content: "Sign in to Molade to see your ranked coursework and deadlines." },
      { property: "og:title", content: "Sign in — Molade" },
      { property: "og:description", content: "Pick up where you left off. Your ranked deadlines are waiting." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { email } = Route.useSearch();
  return (
    <AuthLayout
      mode="login"
      title="Welcome back"
      subtitle="Pick up where you left off. Your ranking is already up to date."
      submitLabel="Sign in"
      initialValues={email ? { email } : undefined}
      fields={[
        { name: "email", label: "University email", type: "email", placeholder: "you@ulster.ac.uk", autoComplete: "email" },
        { name: "password", label: "Password", type: "password", placeholder: "••••••••", autoComplete: "current-password" },
      ]}
      footer={<AuthSwitchLink to="/register" prompt="New to Molade?" label="Create an account" />}
    />
  );
}
