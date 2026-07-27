import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarClock,
  Gauge,
  CircleDot,
  Mail,
  ListChecks,
  Sparkles,
  LayoutDashboard,
  Check,
  Minus,
} from "lucide-react";
import heroImage from "@/assets/hero-atmosphere.jpg";
import { Button } from "@/components/ui/button";
import { MarketingFooter, MarketingNavbar } from "@/components/molade/marketing-chrome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Molade — Know what matters next" },
      {
        name: "description",
        content:
          "Molade is an intelligent task manager for university students. It ranks coursework by deadline, workload and status, and explains every recommendation.",
      },
      { property: "og:title", content: "Molade — Know what matters next" },
      {
        property: "og:description",
        content:
          "Your deadlines, ranked with reasons. A calm academic companion for coursework, exams and projects.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="atmosphere grain min-h-screen">
      <MarketingNavbar />

      {/* HERO — one composition */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt=""
          width={1920}
          height={1088}
          aria-hidden
          className="absolute inset-0 -z-10 size-full object-cover opacity-70"
        />
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--background) 55%, transparent), color-mix(in oklab, var(--background) 88%, transparent))",
          }}
        />
        <div className="mx-auto flex min-h-[86vh] max-w-6xl flex-col justify-center px-5 py-24">
          <p className="rise font-display text-[clamp(2.5rem,9vw,5rem)] leading-none tracking-tight">
            Molade
          </p>
          <h1
            className="rise mt-6 max-w-3xl text-[clamp(2.25rem,6vw,4.25rem)] leading-[1.02]"
            style={{ animationDelay: "0.1s" }}
          >
            Your deadlines, <span className="text-gradient">ranked with reasons</span>.
          </h1>
          <p
            className="rise mt-6 max-w-xl text-base text-muted-foreground sm:text-lg"
            style={{ animationDelay: "0.2s" }}
          >
            Molade reads your coursework, exams and personal commitments, then tells you exactly
            what to do next — and why.
          </p>
          <div className="rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "0.3s" }}>
            <Button asChild size="lg" className="rounded-full px-7">
              <Link to="/register">
                Get started <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-border px-7">
              <a href="#how">See how it works</a>
            </Button>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <Section id="problem" eyebrow="The problem">
        <div className="grid gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] md:items-end">
          <h2 className="text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.08]">
            Six modules, four deadlines, one week. Everything feels urgent, so nothing gets started.
          </h2>
          <p className="text-muted-foreground">
            Generic to-do apps hand you an empty list and expect you to be your own project manager.
            Semester after semester, the thing that slips isn’t effort — it’s sequencing.
          </p>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
          {[
            ["Flat lists", "Every task looks the same weight, so the loudest one wins."],
            ["Manual priority", "You re-triage by hand each morning and still second-guess it."],
            ["Silent deadlines", "Nothing warns you when effort no longer fits the time left."],
          ].map(([t, d]) => (
            <div key={t} className="bg-background p-6">
              <h3 className="text-base font-semibold">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* SOLUTION */}
      <Section eyebrow="The solution">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <div>
            <h2 className="text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.08]">
              Automatic prioritisation you can actually argue with.
            </h2>
            <p className="mt-5 max-w-lg text-muted-foreground">
              Molade scores every task on deadline proximity, workload against the time remaining,
              current status and overdue risk. The rules are fixed and visible — no black box, no
              mystery algorithm.
            </p>
            <Link
              to="/app/priorities"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-teal hover:underline"
            >
              See a live ranking <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="glass rounded-2xl p-6">
            <p className="text-[10px] tracking-[0.2em] text-muted-foreground uppercase">Next up</p>
            <p className="font-display mt-3 text-2xl">Dissertation Draft — Chapter 3</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Due in 17h · High workload · In progress
            </p>
            <div className="mt-6 space-y-3">
              {[
                [CalendarClock, "Deadline proximity", "Less than 24 hours remaining", 42],
                [Gauge, "Workload vs time", "~14h of work against 17h left", 24],
                [CircleDot, "Status", "Already underway", 5],
              ].map(([Icon, label, detail, w]) => {
                const I = Icon as typeof CalendarClock;
                return (
                  <div key={label as string} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
                    <I className="size-4 text-teal" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium">{label as string}</div>
                      <div className="truncate text-xs text-muted-foreground">{detail as string}</div>
                    </div>
                    <span className="font-mono text-xs text-muted-foreground">+{w as number}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Section>

      {/* HOW IT WORKS */}
      <Section id="how" eyebrow="How it works">
        <h2 className="max-w-2xl text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.08]">
          Three steps. No setup ritual.
        </h2>
        <ol className="mt-14 grid gap-10 sm:grid-cols-3">
          {[
            ["01", "Capture", "Add the task, module, deadline and a rough effort estimate. Twenty seconds."],
            ["02", "Rank", "Molade scores it against everything else you're carrying, instantly."],
            ["03", "Finish", "Work the top of the list. Reminders arrive before deadlines, not after."],
          ].map(([n, t, d]) => (
            <li key={n}>
              <span className="font-mono text-xs text-teal">{n}</span>
              <h3 className="mt-3 text-xl">{t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* FEATURES */}
      <Section id="features" eyebrow="Inside Molade">
        <h2 className="max-w-2xl text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.08]">
          Less guessing. More finishing.
        </h2>
        <div className="mt-14 grid gap-10 sm:grid-cols-2">
          {[
            [ListChecks, "Tasks", "Filter by today, upcoming, overdue or completed. Search across modules. Complete with one keystroke."],
            [Sparkles, "Priorities", "A ranked queue with the reasoning attached to every position, and a one-click recalculation."],
            [LayoutDashboard, "Dashboard", "Completion rate, deadlines this week and a workload heat strip — answering “what now?” in one glance."],
            [Mail, "Email reminders", "Choose 24h, 12h or 3h before a deadline. Priority changes and overdue alerts included."],
          ].map(([Icon, t, d]) => {
            const I = Icon as typeof Mail;
            return (
              <div key={t as string} className="border-t border-border pt-6">
                <I className="size-5 text-teal" />
                <h3 className="mt-4 text-xl">{t as string}</h3>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">{d as string}</p>
              </div>
            );
          })}
        </div>
      </Section>

      {/* COMPARISON */}
      <Section eyebrow="Versus generic tools">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
          <h2 className="text-[clamp(1.9rem,4.4vw,3rem)] leading-[1.08]">
            A list app asks you what matters. Molade tells you.
          </h2>
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 border-b border-border bg-surface/60 px-5 py-3 text-xs tracking-wide text-muted-foreground uppercase">
              <span />
              <span className="w-20 text-center">Generic</span>
              <span className="w-20 text-center text-teal">Molade</span>
            </div>
            {[
              ["Priority set automatically", false],
              ["Explains why a task ranks first", false],
              ["Workload weighed against time left", false],
              ["Overdue risk detection", false],
              ["Academic module structure", false],
            ].map(([label]) => (
              <div
                key={label as string}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 border-b border-border/60 px-5 py-4 text-sm last:border-0"
              >
                <span className="min-w-0">{label as string}</span>
                <span className="grid w-20 place-items-center text-muted-foreground">
                  <Minus className="size-4" />
                </span>
                <span className="grid w-20 place-items-center text-teal">
                  <Check className="size-4" />
                </span>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* FINAL CTA */}
      <section className="px-5 py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-[clamp(2rem,5.4vw,3.5rem)] leading-[1.05]">Know what matters next.</h2>
          <p className="mx-auto mt-5 max-w-md text-muted-foreground">
            Start with your current semester. It takes one deadline to feel the difference.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="rounded-full px-7">
              <Link to="/register">Create your account</Link>
            </Button>
            <Button asChild size="lg" variant="ghost" className="rounded-full px-7">
              <Link to="/app">Explore the demo</Link>
            </Button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

function Section({
  id,
  eyebrow,
  children,
}: {
  id?: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-border/60 px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <p className="mb-10 font-mono text-[11px] tracking-[0.25em] text-teal uppercase">{eyebrow}</p>
        {children}
      </div>
    </section>
  );
}
