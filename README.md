# CapySprint — Energy-Aware Micro-Sprint Productivity Engine

> **Turn overwhelming to-do lists into 10–20 minute energy-matched focus sprints—with a hidden capybara zen companion.**

Built for the **Teens Hack Houston Hackathon (Triple H 2026)** under the **Productivity** theme.

---

## Why CapySprint?

Traditional to-do lists treat a 2-hour lab report the same when you are exhausted at 9:00 PM as when you are sharp at 10:00 AM. That mismatch causes **task paralysis** and procrastination.

**CapySprint** adapts your workload to your real-time mental bandwidth, breaking intimidating tasks into low-friction 10–20 minute wins so you can build momentum immediately.

---

## Key Features

- **Real-Time Energy Check-In:** Select **Low / Foggy**, **Steady Flow**, or **Peak Focus**, and CapySprint dynamically re-ranks your queue to highlight `BEST MATCH` sprints.
- **Brain-Dump Auto-Slicer:** Paste a messy wall of tasks or deadlines. CapySprint decomposes heavy goals into a 3-step micro-sprint ladder (*10m Warm-up → 20m Core Sprint → 10m Polish*) with automatic energy and category tagging. Works 100% offline with zero setup, plus optional **Anakin AI** API support.
- **Anti-Procrastination "Slice Smaller" Escape Hatch:** Stuck mid-session? One click splits the active sprint into two tiny halves so momentum never stalls.
- **Zero-Dependency Web Audio Engine:** Synthesizes custom singing-bowl completion chimes and procedural hot-spring waterfall audio directly in the browser using the Web Audio API.
- **Momentum & Energy Alignment Analytics:** Tracks daily focus minutes against your goal, calculates your **Energy Match Rate %**, visualizes a 5-day streak, and exports a clean Markdown progress report.
- **1-Click Judge Demo Mode:** Pre-populates realistic tasks and a 5-day focus streak so anyone testing the live site can experience every feature in seconds.

---

## Secret Capybara Easter Egg

Tap the **`Chill Mode v1.0`** yuzu leaf badge in the footer **3 times** (or type `capy` anywhere on the page) to summon **Sir Yuzu the Capybara** and unlock **Hot-Spring Zen Mode** with procedural waterfall ambience.

---

## Tech Stack

- **Framework:** Next.js 14 (App Router) & React 18
- **Language:** TypeScript
- **Styling:** Tailwind CSS & Lucide Icons
- **Audio:** Native Web Audio API (`AudioContext` oscillator & pink-noise synthesis)
- **Optional AI:** Anakin AI (`/api/slice` OpenAI-compatible endpoint with deterministic NLP fallback)

---

## Project Structure

```text
capysprint/
├── src/
│   ├── app/
│   │   ├── api/slice/route.ts    # Brain-dump task decomposition API (Offline + Anakin AI)
│   │   ├── globals.css           # Tailwind base styles
│   │   ├── layout.tsx            # Root metadata & dark theme shell
│   │   └── page.tsx              # Main energy-aware workspace & keyboard shortcuts
│   ├── components/
│   │   ├── CapyMascot.tsx        # Custom SVG Sir Yuzu illustration & Zen Mode modal
│   │   ├── MomentumPanel.tsx     # Daily goal KPIs, Energy Match Rate, & 5-day bar chart
│   │   └── SprintTimer.tsx       # Circular SVG countdown ring & "Slice Smaller" control
│   ├── lib/
│   │   ├── slicer.ts             # Deterministic NLP task slicer & Judge Demo dataset
│   │   └── sound.ts              # Zero-dependency Web Audio API synthesizer
│   └── types/
│       └── sprint.ts             # TypeScript interfaces for sprints, logs, & settings
├── package.json
└── README.md
