import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMolade } from "@/store/molade-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Molade" },
      { name: "description", content: "Profile, password, notification preferences, appearance and privacy for your Molade account." },
      { property: "og:title", content: "Settings — Molade" },
      { property: "og:description", content: "Control your profile, reminders and appearance." },
    ],
  }),
  component: Settings,
});

function Settings() {
  const { user, setUser, prefs, setPrefs } = useMolade();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [programme, setProgramme] = useState(user.programme);
  const [dense, setDense] = useState(false);

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
          onSubmit={(e) => {
            e.preventDefault();
            setUser({ name, email, programme });
            toast.success("Profile updated");
          }}
        >
          <FieldWrap label="Full name" id="s-name">
            <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} />
          </FieldWrap>
          <FieldWrap label="University email" id="s-email">
            <Input id="s-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FieldWrap>
          <div className="sm:col-span-2">
            <FieldWrap label="Programme" id="s-prog">
              <Input id="s-prog" value={programme} onChange={(e) => setProgramme(e.target.value)} />
            </FieldWrap>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Save profile</Button>
          </div>
        </form>
      </Section>

      <Section title="Password" hint="Use at least 8 characters, including a number.">
        <form
          className="grid gap-5 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Password updated", { description: "Demo mode — nothing was sent." });
          }}
        >
          <FieldWrap label="Current password" id="s-cur">
            <Input id="s-cur" type="password" autoComplete="current-password" placeholder="••••••••" />
          </FieldWrap>
          <FieldWrap label="New password" id="s-new">
            <Input id="s-new" type="password" autoComplete="new-password" placeholder="••••••••" />
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
              <Switch id={`n-${key}`} checked={prefs[key]} onCheckedChange={(v) => setPrefs({ [key]: v })} />
            </div>
          ))}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
            <Label className="text-sm">Reminder lead time</Label>
            <div className="flex gap-2">
              {(["24h", "12h", "3h"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setPrefs({ lead: l })}
                  aria-pressed={prefs.lead === l}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs transition-all",
                    prefs.lead === l ? "border-teal/50 bg-teal/15 text-teal" : "border-border text-muted-foreground",
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

      <Section title="Privacy" hint="">
        <div className="flex gap-4 rounded-xl border border-border bg-surface/40 p-5">
          <ShieldCheck className="size-5 shrink-0 text-teal" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Molade processes your coursework details only to rank tasks and schedule reminders. We
            do not profile you, sell data, or share it with third parties. You can export or delete
            everything at any time, in line with UK GDPR.
          </p>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="mt-12 border-t border-border/60 pt-10">
      <h2 className="text-xl">{title}</h2>
      {hint && <p className="mt-2 mb-6 text-sm text-muted-foreground">{hint}</p>}
      <div className={hint ? "" : "mt-6"}>{children}</div>
    </section>
  );
}

function FieldWrap({ label, id, children }: { label: string; id: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-xs tracking-[0.1em] text-muted-foreground uppercase">
        {label}
      </Label>
      {children}
    </div>
  );
}
