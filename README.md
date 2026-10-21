# neXbuild.ai — Construction Copilot

An AI-powered decision-support interface for construction project schedules: critical path analysis, Monte Carlo risk simulation, weather deviation analysis, and PDF export of the Gantt chart.

## Getting Started

```bash
npm install
npm run dev
```

Opens at http://localhost:3000.

## Structure

- `app/page.tsx` — entry point, renders the `NexbuildCopilot` component.
- `components/NexbuildCopilot.tsx` — main three-tab interface: Copilot chat, Gantt chart, Monte Carlo simulation; critical path task panel on the right.
- `components/IcosahedronLogo.tsx` — redrawn SVG icon based on the reference logo's icosahedron mark.
- `resources/` — source reference materials (customer interview, BuildDecision AI reports, decks, customer validation survey, original logo reference). Reference only, not included in the build.

## PDF Export

The "Export PDF" button in the top bar (and on the Gantt tab) captures the active tab's content with `html2canvas-pro` and outputs a landscape A3 PDF via `jspdf` (`html2canvas-pro` is used because the original `html2canvas` does not support the `oklch`/`lab` color functions Tailwind v4 generates).

Recommended backend alternative for higher-resolution / vector output: server-side headless rendering with Node.js + Puppeteer.

## Next Steps

- Wire the Monte Carlo simulation to a real backend (Python/Pandas or Node) — the UI currently runs on mock data.
- Pull live NOAA/ECMWF historical weather data from an API.
- Feed the interview/survey findings in `resources/docs` and `resources/survey` into product priorities.
