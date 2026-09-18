# Virtual Physics Laboratory (VPL)

An interactive web laboratory. Students don't read about physics experiments — they perform them:
set up apparatus, take readings with instruments that have real resolution, let the physics layer do
the arithmetic, then graph, conclude and save.

```
Learn → Set up → Experiment → Measure → Calculate → Graph → Conclude → Save
```

Two experiments are live: **Ohm's law** (sweep V, read I, take R from the graph slope) and
**simple pendulum** (time N oscillations at several lengths, get g from the T²-L gradient).

## Quick start

```bash
npm install --legacy-peer-deps   # see "Install note" below
npm run dev                      # http://localhost:5173
```

```bash
npm run typecheck   # tsc --noEmit, strict
npm run test        # 26 tests over the physics layer
npm run build       # typecheck + production bundle
```

**Install note:** plain `npm install` currently trips an npm/arborist peer-resolution crash
(`Cannot read properties of null (reading 'edgesOut')`) while resolving vitest's peer set.
`--legacy-peer-deps` avoids it; `package-lock.json` is already resolved that way.

## Reference repositories

Physics logic and interaction patterns are adapted from two upstream repos, pinned as submodules and
treated as **read-only reference material** — never imported by the build, never merged wholesale.

| Path | Upstream | Pinned at |
| --- | --- | --- |
| `source/physics-sims` | [IlliniOpenEdu/PhysicsSims](https://github.com/IlliniOpenEdu/PhysicsSims) (mirrored as `hamzsavai-crypto/VPL`) | `bd7144d` |
| `source/animate-ui-materials` | [lgarczyn/AnimateUIMaterials](https://github.com/lgarczyn/AnimateUIMaterials) (mirrored as `hamzsavai-crypto/ANIMATe`) | `c7537f7` |

Clone with them populated:

```bash
git clone --recurse-submodules https://github.com/hamzsavai-crypto/project-2.git
# or, on an existing clone:
git submodule update --init --recursive
```

To pull newer upstream commits and record the new pointers:

```bash
git submodule update --remote --merge
git add source/physics-sims source/animate-ui-materials
git commit -m "Bump reference pointers"
```

Note `source/animate-ui-materials` is a **Unity C#/ShaderLab** package. It cannot contribute React
code; it is pinned for reference only. See [docs/ATTRIBUTION.md](docs/ATTRIBUTION.md).

## Layout

```
src/
  app/          layout, nav, footer
  pages/        route wrappers - no lab logic
  components/
    lab/        ExperimentShell + panels   ← the reusable laboratory engine
    sim/        interactive apparatus rigs
    charts/     SVG graphing surface
    ui/         design-system primitives
  features/
    experiments/ definitions (data) + run state + attempt store
    concepts/    theory notes
  physics/      pure physics, no React, unit-tested  ← all arithmetic lives here
  lib/          analysis contract, formatting, stats helpers
source/         pinned upstream repos (reference only)
docs/           PLAN.md, ATTRIBUTION.md
```

Dependency direction is one-way: `pages → components/lab → features → lib/lab → physics`.

## Adding an experiment

1. Write its physics in `src/physics/<area>/<name>.ts` plus tests in `src/physics/__tests__/`.
2. Describe it in `src/features/experiments/experiments/<name>.ts` — theory, apparatus, procedure,
   variables, reading columns, tolerance, and an `analyse()` that returns the shared
   `AnalysisOutput`.
3. Add a rig component in `src/components/sim/` and register it in `SIMS`.
4. Add it to `EXPERIMENTS` in `registry.ts`.

Navigation, gating, the observation table, the graph, the result box and saving all come for free.

## Status

Phase 1 (foundation), Phase 2 (Ohm's law) and Phase 3 (pendulum) are implemented, along with local
attempt history. Accounts, lens/projectile experiments and the standalone simulation library are
queued — see [docs/PLAN.md](docs/PLAN.md) for the phase table and the decisions still open.
