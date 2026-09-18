# VPL — Build Plan (re-baselined)

Status: **Phase 1 + 2 + 3 implemented** in this repository. Phases 4+ are the queue.
This document supersedes the pre-implementation plan wherever they disagree, and says why.

## What the naming correction changed

The original plan described `PhysicsSims` and `VPL` as two repositories, with VPL built as a new
application that mines PhysicsSims for ingredients. In this checkout they are the same codebase:
`hamzsavai-crypto/VPL` was a mirror of `IlliniOpenEdu/PhysicsSims` at the identical commit
(`bd7144d`). The corrected mapping used throughout:

| Name | Repo | Role here |
| --- | --- | --- |
| PhysicsSims | `hamzsavai-crypto/VPL` | **source material**, pinned at `source/physics-sims` |
| VPL (product) | `hamzsavai-crypto/project-2` | **this repository**, the application |
| Animate UI Materials | `hamzsavai-crypto/ANIMATe` | pinned at `source/animate-ui-materials`, see below |

Consequences that mattered:

1. **"Don't copy the app into VPL" became "don't fork the app into itself."** The lab layer is
   therefore written as a new application, with PhysicsSims consulted through its pinned submodule
   and its licences tracked in [ATTRIBUTION.md](./ATTRIBUTION.md).
2. **`ANIMATe` is a Unity package, not a React component library.** `lgarczyn/AnimateUIMaterials`
   is C# + ShaderLab for animating Unity UI materials. It cannot supply React components, so no
   code was taken from it; it is kept as a pinned reference for animation feel and for any Unity
   deliverable. The plan's "Animate UI strategy" section was written against `imskyleen/animate-ui`
   (React + Tailwind + Motion), which is a different project.
3. **`imskyleen/animate-ui` was not installed.** It targets Tailwind v4 (`tailwindcss ^4.1.13`,
   `@tailwindcss/postcss`) while the ecosystem these repos sit in is Tailwind 3.4 with a JS config;
   installing it would have meant a CSS-framework migration before any feature work. Its licence is
   also **MIT + Commons Clause**, not plain MIT — components may be used inside a product but not
   redistributed in original form. The useful patterns (shared-layout tab indicator, press feedback,
   animated counters, step transitions) were re-implemented by hand in `src/components/ui/` against
   framer-motion, which was already the shared dependency.
4. **PhysicsSims ships no charting at all** — no recharts, chart.js, victory, visx or plotly anywhere
   in its tree. VPL's graphs are a hand-rolled SVG surface over `d3-scale` (`src/components/charts/LabGraph.tsx`),
   which keeps the axes looking like an instrument and adds one small dependency instead of a library.
5. **Reuse is per-module, not per-repository.** The circuit solver in `src/lib/circuit/solver.ts` is a
   genuine modified-nodal-analysis engine and is worth lifting intact for an open circuit sandbox.
   The pendulum maths, by contrast, is embedded in a 1023-line page (`PendulumExplorer.tsx`) — only
   the integrator was worth taking. Assuming either could be reused wholesale would have been wrong.

## Architecture as built

```
pages/            thin route wrappers, no lab logic
  ↓
components/lab/   ExperimentShell + step rail + panels      ← the reusable engine
  ↓
features/         experiment definitions (data) + run state
  ↓
lib/lab/analysis  the contract: columns, stats, graph, result
  ↓
physics/          pure functions, no React, unit-tested     ← all arithmetic lives here
```

Two rules keep this from rotting:

- **A definition never renders.** `ExperimentDefinition` is data plus one pure `analyse()` call.
- **The shell never computes.** If a number appears on screen, it came from `src/physics/**` and has a test.

Adding experiment *n* is therefore: write a definition, write its physics module + tests, add a rig
to `SIMS` (or reuse one). The navigation, gating, table, graph, result box and saving already exist.

## Experiment model

Implemented in `src/features/experiments/types.ts` as the plan's §13 shape: metadata, theory,
apparatus, procedure, variables, observation schema, tolerance, simulation key, and `analyse`.
Deferred from that design: `persistence` is currently a local-storage record with an
`ExperimentAttempt`-shaped payload, which is the seam for the later API.

Gating is pedagogical rather than cosmetic: Analysis and Result stay locked until `minReadings`
usable rows exist, because a gradient from two points is not a result.

## Bench realism (the part that makes it a laboratory, not a quiz)

- **Ohm's law**: readings come from meters that quantise to their smallest division (0.05 V, 2 mA)
  and carry 1% instrumental error, from a seeded RNG — so the same setup reproduces, and the answer
  is not exactly the truth. Resistor colour codes are derived from the selected value. Source
  resistance lowers terminal voltage without changing the V-I slope, and the analysis says so.
- **Pendulum**: the student releases the bob, arms the stopwatch, and the rig starts the clock at the
  next centre crossing and stops after N complete oscillations. The integrator solves the exact
  `θ̈ = −(g/L)·sin θ`, so a 40° release really does give a slightly long period.

## Verification

```bash
npm run typecheck   # tsc --noEmit, strict + noUncheckedIndexedAccess
npm run test        # 26 tests over the physics layer
npm run build       # typecheck then bundle
```

Install note: `npm install` currently hits an npm/arborist peer-resolution crash
(`Cannot read properties of null (reading 'edgesOut')`) while resolving vitest's peer set. Use
`npm install --legacy-peer-deps`; the committed `package-lock.json` already reflects that resolution.

## Phases

| Phase | Scope | State |
| --- | --- | --- |
| 1 | App shell, routing, design tokens, experiment model, shell UI, chart primitive | **done** |
| 2 | Ohm's law end-to-end: sim → readings → analysis → graph → result → save | **done** |
| 3 | Pendulum end-to-end, reusing the engine (stopwatch rig, T²-L gradient → g) | **done** |
| 3.5 | My Laboratory: history list, reopen onto the bench, delete | **done** |
| 4 | Lens / focal length: optical bench, 1/u + 1/v reciprocal treatment | next |
| 5 | Projectile motion: measured vs predicted, with residuals | queued |
| 6 | Circuit sandbox by lifting the MNA solver; standalone simulation library | queued |
| 7 | Accounts: registration, sessions, server-side attempts (replaces `attempts.ts`) | queued |
| 8 | Student dashboard: progress, favourites, curriculum mapping | queued |

Two MVP candidates were deliberately **not** built: series/parallel resistance (it overlaps the
circuit rig and wants the real solver, so it belongs in Phase 6) and Young's modulus (needs its own
apparatus and a stress-strain workflow). Both are listed in the app's backlog with the reason.

## Open decisions still open

1. **Product shape** — the plan recommended "laboratory-first with concepts and simulations
   first-class" and that is what the routes assume. If a course/quizzes direction is chosen later,
   Concepts becomes a real content tree instead of curated notes; nothing in the engine changes.
2. **Deployment base** — PhysicsSims deploys to GitHub Pages under `/PhysicsSims/` and still has
   open routing/blank-page branches upstream. VPL is built for a domain root (`base: '/'`); if this
   ships to Pages under a subpath, `base` and the router `basename` must both change.
3. **Where VPL lives** — this repository is currently named `project-2`. The product is VPL, so a
   rename is worth doing before links and deployment configs hardcode it.
