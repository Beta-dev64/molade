# Molade: Know What Matters

Build a production-quality frontend UI for “Molade” — an Intelligent Task Management System for university students.

This is NOT a generic productivity app clone. It is a focused academic companion that helps students organize coursework, track deadlines, and see what to do next through automatic, explainable prioritization.

Do not use a backend. Use polished mock data and local UI state so every screen feels real and interactive.

==================================================

PRODUCT IDENTITY

==================================================

Product name: Molade

Tagline: Know what matters next.

Audience: University students managing coursework, exams, projects, and personal commitments.

Core promise: Automatic task prioritization based on deadline urgency, task status, and workload — with clear explanations of why a task is prioritized.

Brand personality:

- Calm, sharp, trustworthy, academically serious but modern

- Encouraging without being childish

- Premium student-tool energy (not corporate SaaS, not neon startup)

==================================================

VISUAL DIRECTION (VERY IMPORTANT)

==================================================

Create a visually stunning, memorable interface. Treat the first viewport of marketing + app shell as one composed experience.

Color direction (define CSS variables):

- Base: deep ink navy / charcoal (#0B1220, #111827)

- Surface: soft slate glass panels with subtle translucency

- Accent: luminous teal-cyan (#14B8A6 → #22D3EE), used sparically for CTAs and priority signals

- Secondary accent: warm amber (#F59E0B) only for deadlines / urgency

- Success: soft emerald

- Text: near-white primary, muted slate secondary

- Avoid: purple/indigo themes, cream+terracotta, generic Inter-only look, neon glow spam, endless pill badges, heavy multi-layer shadows

Typography:

- Display/headings: distinctive modern serif or expressive display font (e.g. Fraunces / Instrument Serif / Playfair alternative)

- Body/UI: clean geometric sans (e.g. Geist / Satoshi / Plus Jakarta Sans)

- Strong hierarchy: large editorial headlines, compact supporting text

- Never use default system/Inter-only stacks as the whole identity

Background & atmosphere:

- Dark atmospheric gradient mesh + subtle grain/noise

- Soft radial light blooms behind hero and dashboard focal areas

- Not flat single-color backgrounds

- App screens should feel immersive yet readable

Motion (intentional, 2–4 signature motions):

1. Soft fade/slide entrance for page sections

2. Priority cards gently reordering / highlighting when “Recalculate priorities” is clicked

3. Progress rings/bars animating on dashboard load

4. Micro-interactions on buttons, checkbox completion, and hover states

Keep motion elegant and purposeful — no noisy animation overload.

Cards policy:

- Avoid card-heavy dashboard clutter

- Use cards only where interaction needs a container (task item, recommendation explanation panel)

- Prefer open composition, spacing, and typographic structure over boxed widgets everywhere

==================================================

INFORMATION ARCHITECTURE / PAGES

==================================================

Build a complete multi-page frontend with routing:

1) Marketing Landing Page (/)

2) Auth: Login (/login)

3) Auth: Register (/register)

4) App Dashboard (/app)

5) Tasks (/app/tasks)

6) Task Detail / Editor drawer or page (/app/tasks/:id)

7) Priorities / Recommendations (/app/priorities)

8) Analytics (/app/analytics)

9) Notifications Center (/app/notifications)

10) Settings / Profile (/app/settings)

11) Empty states + 404

Also include a polished authenticated app shell:

- Left sidebar (desktop) / bottom nav or drawer (mobile)

- Top bar with search, notification bell, user avatar

- Persistent “Next up” priority strip

==================================================

LANDING PAGE REQUIREMENTS

==================================================

First viewport (hero) must be ONE composition:

- Brand name “Molade” as hero-level signal (not just nav text)

- One headline

- One short supporting sentence

- One CTA group (Get started + See how it works)

- One dominant full-bleed atmospheric visual plane/background (abstract academic/time-flow visual, not inset media card collage)

No stats strips, badge clusters, or promo stickers in the first viewport.

Below fold sections (one job each):

1. Problem: students drowning in deadlines

2. Solution: automatic prioritization with explanations

3. How it works (3 clear steps)

4. Feature showcase: tasks, priorities, dashboard, email reminders

5. Comparison teaser vs generic tools (manual priority vs Molade automatic)

6. Final CTA

Footer with simple links

==================================================

AUTH PAGES

==================================================

Login + Register:

- Beautiful split or centered atmospheric layout

- Fields: name (register), email, password, confirm password

- Social button placeholders optional but secondary

- Strong validation UI states

- Link between login/register

- Trust microcopy about privacy / academic focus

==================================================

APP FEATURES TO DESIGN (UI + INTERACTION)

==================================================

A) Dashboard (/app)

Purpose: immediate clarity — what should I do now?

Include:

- Greeting + current academic focus line

- “Next up” recommended task with explanation (“Due in 18h · High workload · Incomplete”)

- Priority list (top 5) with urgency indicators

- Progress overview (completion rate, upcoming deadlines this week)

- Quick add task

- Workload heat style visualization (simple, elegant)

- Recent activity

B) Tasks (/app/tasks)

- Filters: All / Today / Upcoming / Overdue / Completed

- Sort: Priority / Deadline / Created

- Search

- Task list with:

  - title

  - course/module tag

  - deadline

  - computed priority score/label (Critical / High / Medium / Low)

  - status

  - checkbox complete animation

- Create Task modal/drawer:

  - title

  - description

  - course/module

  - deadline datetime

  - estimated effort (S/M/L or hours)

  - status

  - optional personal priority preference (system still auto-ranks)

- Bulk-friendly visual density, but premium spacing

C) Priorities (/app/priorities)

This is the signature screen.

- Ranked recommended tasks

- Each item shows explainability chips/reasons:

  - Deadline proximity

  - Workload/effort

  - Status

  - Overdue risk

- “Why this ranking?” expandable panel

- Button: Recalculate priorities (animates reorder)

- Clear copy that this is rule-based and transparent (not a black-box AI)

D) Analytics (/app/analytics)

- Completion trends (weekly)

- On-time vs late

- Course workload distribution

- Streak / consistency indicator

- Keep charts elegant and minimal; no cluttered BI dashboard look

E) Notifications (/app/notifications)

- Deadline reminders

- Priority changes

- Overdue alerts

- UI for email notification preferences (enabled/disabled, timing: 24h / 12h / 3h before due)

F) Settings (/app/settings)

- Profile

- Password

- Notification preferences

- Appearance (dark default; optional lighter denser mode if easy)

- Privacy note (UK GDPR friendly language: data used only for app functionality)

==================================================

TASK PRIORITY VISUAL LANGUAGE

==================================================

Priority levels:

- Critical: amber/red-urgent accent, strongest visual weight

- High: strong teal

- Medium: muted blue-slate

- Low: quiet gray

Always show:

- Priority label

- Short explanation line

- Deadline countdown (“Due tomorrow”, “Due in 3h”, “Overdue by 1d”)

==================================================

MOCK DATA (MAKE IT FEEL REAL)

==================================================

Seed realistic student tasks, e.g.:

- COM814 Dissertation Draft Chapter 3

- HCI Usability Report

- Database Coursework Submission

- Exam Revision: Algorithms

- Group Project Meeting Notes

- Personal: Visa Document Upload

Include varied deadlines, statuses, efforts, and auto-ranked outcomes.

==================================================

UX QUALITY BAR

==================================================

- Mobile-first responsive excellence

- Desktop: spacious, elegant app layout

- Keyboard-friendly forms

- Loading skeletons

- Empty states that are helpful and beautiful

- Toast feedback for create/update/complete

- Accessible contrast and focus states

- Consistent spacing system (8pt)

- Component polish equal to top-tier product design

==================================================

COMPONENT SYSTEM TO BUILD

==================================================

- AppShell (sidebar/topbar)

- PriorityBadge

- TaskRow

- TaskForm

- ExplanationPanel

- StatMeter / ProgressRing

- DeadlineCountdown

- EmptyState

- Modal/Drawer

- Toast

- Chart primitives

- MarketingNavbar / Footer

- CTAButton / GhostButton

==================================================

COPY TONE

==================================================

Clear, confident, concise.

Examples:

- “Know what matters next.”

- “Your deadlines, ranked with reasons.”

- “Less guessing. More finishing.”

Avoid emoji-heavy UI and generic startup fluff.

==================================================

TECH / IMPLEMENTATION NOTES FOR LOVABLE

==================================================

- React + Tailwind

- Clean component structure

- React Router for pages

- Local state + mock data layer (context or simple store)

- Framer Motion (or similar) for the signature animations

- Lucide icons

- Fully working UI flows with mock interactions

- Ready for later API integration (structure services/hooks cleanly)

==================================================

SUCCESS CRITERIA

==================================================

When finished, the UI should feel like a premium student productivity product:

1. Landing page is brand-led and visually unforgettable

2. Dashboard instantly answers “what should I do now?”

3. Priorities page makes the intelligent recommendation system tangible and explainable

4. Task workflows are fast and delightful

5. Whole experience looks cohesive, modern, and thesis-demo ready

Build the complete frontend now, with all pages connected and interactive mock data.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://molade.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d3e808ca-9c67-4f29-89a0-afd56d5174dd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
