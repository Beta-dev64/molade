import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMolade } from "@/store/molade-store";
import { usersApi } from "@/lib/api/resources";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Molade" },
      {
        name: "description",
        content:
          "Profile, password, notification preferences, appearance and privacy for your Molade account.",
      },
      { property: "og:title", content: "Settings — Molade" },
      { property: "og:description", content: "Control your profile, reminders and appearance." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const navigate = useNavigate();
  const {
    user,
    setUser,
    prefs,
    setPrefs,
    changePassword,
    logout,
    reducedMotion,
    setReducedMotion,
    setTourSeen,
  } = useMolade();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [programme, setProgramme] = useState(user.programme);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [dense, setDense] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
    setProgramme(user.programme);
  }, [user]);

  useEffect(() => {
    const el = document.documentElement;
    el.classList.toggle("tone-light", dense);
    return () => el.classList.remove("tone-light");
  }, [dense]);

  return (
    <div className="mx-auto max-w-3xl">
      <header className="rise">
        <h1 className="text-[clamp(1.9rem,4vw,2.5rem)] leading-tight">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Your account, your reminders, your view.</p>
      </header>

      <Section title="Profile" hint="Shown across your dashboard and reminders.">
        <form
          className="grid gap-5 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            setSaving(true);
            try {
              await setUser({ name, email, programme });
            } finally {
              setSaving(false);
            }
          }}
        >
          <FieldWrap label="Full name" id="s-name">
            <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} />
          </FieldWrap>
          <FieldWrap label="University email" id="s-email">
            <Input
              id="s-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FieldWrap>
          <div className="sm:col-span-2">
            <FieldWrap label="Programme" id="s-prog">
              <Input
                id="s-prog"
                value={programme}
                onChange={(e) => setProgramme(e.target.value)}
              />
            </FieldWrap>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving}>
              Save profile
            </Button>
          </div>
        </form>
      </Section>

      <Section title="Password" hint="Use at least 8 characters, including a number.">
        <form
          className="grid gap-5 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault();
            if (newPassword.length < 8) {
              toast.error("Use at least 8 characters");
              return;
            }
            await changePassword(currentPassword, newPassword);
            setCurrentPassword("");
            setNewPassword("");
          }}
        >
          <FieldWrap label="Current password" id="s-cur">
            <Input
              id="s-cur"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </FieldWrap>
          <FieldWrap label="New password" id="s-new">
            <Input
              id="s-new"
              type="password"
              autoComplete="new-password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </FieldWrap>
          <div className="sm:col-span-2">
            <Button type="submit" variant="outline" className="border-border">
              Update password
            </Button>
          </div>
        </form>
      </Section>

      <Section title="Notifications" hint="Fine-tune what reaches your inbox.">
        <div className="space-y-5">
          {(
            [
              ["email", "Email reminders"],
              ["priorityChanges", "Priority change alerts"],
              ["weeklyDigest", "Weekly summary"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
              <Label htmlFor={`n-${key}`} className="text-sm">
                {label}
              </Label>
              <Switch
                id={`n-${key}`}
                checked={prefs[key]}
                onCheckedChange={(v) => void setPrefs({ [key]: v })}
              />
            </div>
          ))}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <Label className="text-sm">Reminder lead time</Label>
            <div className="flex gap-2">
              {(["24h", "12h", "3h"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => void setPrefs({ lead: l })}
                  aria-pressed={prefs.lead === l}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-all",
                    prefs.lead === l
                      ? "border-teal/50 bg-teal/15 text-teal"
                      : "border-border text-muted-foreground",
                  )}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      <Section title="Appearance" hint="Molade is dark by default — built for late library sessions.">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="min-w-0">
            <Label htmlFor="tone" className="text-sm">
              Light, denser mode
            </Label>
            <p className="mt-1 text-xs text-muted-foreground">Higher contrast on bright screens.</p>
          </div>
          <Switch id="tone" checked={dense} onCheckedChange={setDense} />
        </div>
      </Section>

      <Section title="Accessibility" hint="Molade should work the way you need it to.">
        <div className="space-y-6">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <Label htmlFor="reduced-motion" className="text-sm">
                Reduce motion
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">
                Turns off entrance animations, reordering transitions and chart motion. Follows your
                system setting by default.
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={reducedMotion}
              onCheckedChange={(v) => {
                setReducedMotion(v);
                toast.success(v ? "Motion reduced" : "Motion restored");
              }}
            />
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">Product walkthrough</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Replay the three-step tour covering next up, priorities and ranking reasons.
              </p>
            </div>
            <Button
              variant="outline"
              className="border-border"
              onClick={() => {
                setTourSeen(false);
                toast.success("Walkthrough will start on your dashboard");
              }}
            >
              Replay tour
            </Button>
          </div>
        </div>
      </Section>

      <Section title="Privacy" hint="">
        <div className="flex gap-4 rounded-xl border border-border bg-surface/40 p-5">
          <ShieldCheck className="size-5 shrink-0 text-teal" />
          <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
            <p>
              Molade processes your coursework details only to rank tasks and schedule reminders. We
              do not profile you, sell data, or share it with third parties — in line with UK GDPR.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-border"
                onClick={async () => {
                  const data = await usersApi.exportData();
                  const blob = new Blob([JSON.stringify(data, null, 2)], {
                    type: "application/json",
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = "molade-export.json";
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success("Export downloaded");
                }}
              >
                Export my data
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-crit/40 text-crit"
                onClick={async () => {
                  if (!window.confirm("Delete your account and all tasks permanently?")) return;
                  await usersApi.deleteAccount();
                  await logout();
                  toast.success("Account deleted");
                  navigate({ to: "/" });
                }}
              >
                Delete account
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await logout();
                  navigate({ to: "/login" });
                }}
              >
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-12 border-t border-border/60 pt-10">
      <h2 className="text-xl">{title}</h2>
      {hint && <p className="mt-2 mb-6 text-sm text-muted-foreground">{hint}</p>}
      <div className={hint ? "" : "mt-6"}>{children}</div>
    </section>
  );
}

function FieldWrap({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </Label>
      {children}
    </div>
  );
}
