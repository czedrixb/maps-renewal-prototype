# MAPS Renewal Prototype

> **LMS-1591** — UI/UX prototype for the MAPS (Management & Academic Progress System) renewal.

A Next.js prototype that presents **two parallel design directions** (Sample A and Sample B) for the MAPS academy learning-management platform. The goal is to compare different interaction patterns and visual layouts before committing to a production implementation. All data is mocked — there is no backend dependency.

---

## Samples

| | Sample A | Sample B |
|---|---|---|
| **Layout** | Full-width card grid | Sidebar + content |
| **Accent** | Indigo | Sky |
| **Routes** | `/sample-a/*` | `/sample-b/*` |

### Pages (both samples)
- **Dashboard** — VP progress overview, student stats, upcoming tasks
- **Students** — Student roster with group badges and detail view
- **Learning Plans** — Monthly schedule board with drag-and-drop topic reordering
- **Monitoring** — Homework, test scores, attitude evaluation, makeup sessions

### Sample B extras
- **Reports** — Monthly report workflow with multi-step approval status stepper

---

## Tech Stack

| Layer | Library / Version |
|---|---|
| Framework | Next.js 16.2.9 (App Router) |
| UI | React 19.2 · Tailwind CSS v4 |
| Charts | Recharts 3 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| Icons | lucide-react |
| Language | TypeScript 5 |
| i18n | Custom bilingual toggle (`lib/i18n.tsx`) — Korean / English |

---

## Project Structure

```
app/
  page.tsx                 # Landing page — choose Sample A or B
  layout.tsx
  sample-a/                # Sample A routes
    dashboard/page.tsx
    students/page.tsx
    students/[id]/page.tsx
    learning-plans/page.tsx
    monitoring/page.tsx
  sample-b/                # Sample B routes
    dashboard/page.tsx
    students/page.tsx
    learning-plans/page.tsx
    monitoring/page.tsx
    reports/page.tsx

components/
  shared/                  # Shared UI primitives
    GroupBadge.tsx
    StatusBadge.tsx
    VPProgressBar.tsx
    MonthlyScheduleBoard.tsx
    ReportStatusStepper.tsx
  sample-a/AppShellA.tsx
  sample-b/AppShellB.tsx
  Providers.tsx

lib/
  types.ts                 # Domain types (Student, LearningPlan, MonthlyReport …)
  vp.ts                    # VP (학습포인트) calculation helpers
  i18n.tsx                 # Bilingual string map + LanguageToggle component
  mock/
    data.ts                # Static seed data
    api.ts                 # Simulated async API functions
```

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the landing page lets you navigate to either sample.

```bash
npm run build   # production build check
npm run lint    # ESLint
```

---

## Status

🚧 **Prototype** — mock data only, no authentication, no real API calls. Intended for internal design review and stakeholder feedback.

---

*W Labs — Internal prototype. Not for production use.*
