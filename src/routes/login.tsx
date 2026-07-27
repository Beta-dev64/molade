import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout, AuthSwitchLink } from "@/components/molade/auth-layout";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — Molade" },
      { name: "description", content: "Sign in to Molade to see your ranked coursework and deadlines." },
      { property: "og:title", content: "Sign in — Molade" },
      { property: "og:description", content: "Pick up where you left off. Your ranked deadlines are waiting." },
    ],
  }),
  component: () => (
    <AuthLayout
      mode="login"
      title="Welcome back"
      subtitle="Pick up where you left off. Your ranking is already up to date."
      submitLabel="Sign in"
      fields={[
        { name: "email", label: "University email", type: "email", placeholder: "you@ulster.ac.uk", autoComplete: "email" },
        { name: "password", label: "Password", type: "password", placeholder: "••••••••", autoComplete: "current-password" },
      ]}
      footer={<AuthSwitchLink to="/register" prompt="New to Molade?" label="Create an account" />}
    />
  ),
});
