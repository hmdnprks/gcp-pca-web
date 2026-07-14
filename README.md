# GCP PCA Mind Map

An interactive, single-page **mind map for Google Cloud Professional Cloud Architect (PCA)** exam prep. It presents GCP services as an expandable pillar → service tree optimized for rapid recall and architectural decision-making — a macro "bird's-eye" view of your knowledge gaps plus a granular per-service "deep dive."

Built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, and **Lucide** icons.

## Features

- **Visual hierarchy** — root node (`GCP PCA Curriculum`) → 6 core pillars (Compute · Storage & Databases · Networking · Security, Identity & Compliance · Management, Operations & Tools · Data Analytics & AI/ML) → individual services, laid out as clean, responsive, collapsible columns for maximum text readability.
- **Confidence heatmap** — set every service to **Weak** (red), **Reviewing** (amber), or **Mastered** (green). Node tint + per-pillar mastery bars + a global tally let you spot gaps at a glance.
- **Dependency edges** — hovering a service highlights its frequently-paired services (e.g. Pub/Sub ↔ Dataflow, IAP ↔ Cloud Run / Compute Engine) and dims the rest.
- **Search & filter** — live search over service names, taglines, exam keywords and case studies (press `/` to focus), plus filter chips to isolate confidence states (e.g. "show only Weak").
- **Deep-dive panel** — click a node for a slide-out organized by PCA exam domains: Design & Architecture, Security & Compliance, Operations & Reliability, Exam Keywords, Anti-patterns, and Case Study tags (the official v6.1 studies: Altostrat Media, Cymbal Retail, EHR Healthcare, KnightMotives Automotive).
- **Case Study Explorer** — browse the four official PCA case studies (business context, requirements, and the GCP services/decisions each drives) and filter the whole map to a single case study.
- **Scenario quiz** — decision-style questions that update the confidence heatmap (wrong → Weak, correct → Reviewing) with review links.
- **Persistent progress** — confidence levels and expanded/collapsed state are saved to `localStorage`, so study progress survives refreshes.

All **37 services across all 6 pillars are fully populated** with exam-grade content.

## Getting Started

```bash
npm install
npm run dev
```

Open the URL printed in the terminal (defaults to [http://localhost:3000](http://localhost:3000); Next picks the next free port if it's taken).

## Project Structure

```
app/
├── layout.tsx                 # Root layout + metadata (dark theme)
├── page.tsx                   # Renders <MindMap />
├── globals.css                # Tailwind v4 + dark zinc theme
├── components/
│   ├── MindMap.tsx            # Main map: header, search/filter, pillar columns, nodes
│   ├── DetailPanel.tsx        # Slide-out deep-dive panel
│   └── ConfidencePicker.tsx   # Weak / Reviewing / Mastered selector
└── lib/
    ├── curriculum.ts          # Single source of truth: pillars → services → detail
    ├── confidence.ts          # Confidence color/style tokens
    └── icons.ts               # String-key → Lucide icon map
```

## Editing the Curriculum

All content lives in **`app/lib/curriculum.ts`**. To add or change a service, edit its entry in the relevant pillar:

- A service with a `detail: { ... }` block renders full deep-dive content.
- A service without `detail` renders as a structural placeholder (a `stub` badge + "not yet populated" panel).
- `pairings: ["<service-id>", ...]` drives the hover-highlight dependency edges (bidirectional).

Icons are referenced by string key and mapped in `app/lib/icons.ts` (unknown keys fall back to a default).

## Tech Notes

- The interactive map is a Client Component (`"use client"`); `localStorage` is read after mount to avoid SSR hydration mismatches.
- `next/font/google` loads the Geist font at build time, so `next build` requires network access to Google Fonts. Offline builds can swap to `next/font/local` or a system font stack in `app/layout.tsx`.

## Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start the development server   |
| `npm run build` | Production build               |
| `npm run start` | Serve the production build     |
| `npm run lint`  | Run ESLint                     |
