import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout, AuthSwitchLink } from "@/components/molade/auth-layout";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create your account — Molade" },
      { name: "description", content: "Create a Molade account and let your coursework rank itself by deadline, workload and status." },
      { property: "og:title", content: "Create your account — Molade" },
      { property: "og:description", content: "Start the semester knowing what matters next." },
    ],
  }),
  component: () => (
    <AuthLayout
      mode="register"
      title="Start the semester in order"
      subtitle="One account, every module. Molade ranks the moment you add a deadline."
      submitLabel="Create account"
      fields={[
        { name: "name", label: "Full name", type: "text", placeholder: "Adeola Molade", autoComplete: "name" },
        { name: "email", label: "University email", type: "email", placeholder: "you@ulster.ac.uk", autoComplete: "email" },
        { name: "password", label: "Password", type: "password", placeholder: "At least 8 characters", autoComplete: "new-password" },
        { name: "confirm", label: "Confirm password", type: "password", placeholder: "Repeat your password", autoComplete: "new-password" },
      ]}
      footer={<AuthSwitchLink to="/login" prompt="Already have an account?" label="Sign in" />}
    />
  ),
});
