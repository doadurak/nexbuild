# NexBuild.ai — Construction Schedule Copilot

AI you can trace, decisions you can trust. NexBuild.ai is a decision layer on top of the schedule files a contractor already has: exact math calculates, the AI only explains, and a human signs off.

Repository: https://github.com/doadurak/nexbuild

Course project (UPC, A10 2026) by Türkan Doğa Durak, Enric Solé, Andrei Piposi and Jordi Escobar.

## What the prototype does

- **Real CPM engine** (`lib/cpm.ts`): forward and backward pass computed client-side, with early/late start and finish, float and critical path. No mock numbers.
- **Scenario Explorer** (`lib/scenarios.ts`): every point of the cost–duration chart is a real run of the CPM engine on a modified task graph (extra crew, overtime, …).
- **CPM Engine Console**: the calculation step by step, as a log, a diagram and a table.
- **Copilot**: a plain-language answer to a delay question, linked to the live calculation. The wording is illustrative and templated from task data; connecting a language model is a next step.
- **Digital Twin / Construction** (`/construction`): upload your own drawing (PNG or JPG), pin schedule activities on it, or open a 3D model (**View 3D Model**) of a demo project and pin activities to any surface. The 3D models are procedurally generated massing models; importing BIM/IFC is not implemented.
- Light and dark themes, a help chatbot, and an animated promo reel at `/promo`.

## Getting started

```bash
npm install
npm run dev
```

Opens at http://localhost:3000. A production build: `npm run build && npm start`.

Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, react-three-fiber / drei / three, Radix UI.

## Structure

- `app/page.tsx` — dashboard entry, renders `NexbuildCopilot`.
- `app/construction/page.tsx` — Digital Twin page.
- `app/promo/page.tsx` — animated promo reel.
- `components/` — UI: `DashboardHome`, `ScenarioExplorer`, `CopilotCenterModal`, `CpmEngineConsole`, `ConstructionPlansPage`, 3D scenes (`PlazaTower3D`, `ResortVillage3D`, `Scene3DKit`), `PromoReel`, …
- `lib/` — `cpm.ts` (CPM engine), `scenarios.ts`, `projects.ts` (demo projects and tasks), `taskData.ts`.
- `public/plans/` — sample floor plan (Library of Congress HABS collection, public domain).

## Limits and next steps

- The prototype runs entirely client-side with demo data; there is no backend, file import (Excel / MS Project) or persistence yet.
- Connect a language model to explain the engine results, keeping the numbers deterministic.
- Import real schedules (.xml, .mpp, .xlsx) and validate them.
- Import customer BIM/IFC models for the 3D view.
