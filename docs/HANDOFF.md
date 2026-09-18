# Handoff — read this first if you are continuing in a new session

Purpose: let a fresh context (or a future you) resume VPL without re-deriving a week of decisions.
Keep this file current; it is the only durable memory this project has.

Last updated: 2026-09-19 · HEAD `1e9fd01` on `arena/01a0b5eb-project-2` · verified green (see §6)

---

## 1. What this repo is

**VPL — Virtual Physics Laboratory.** Vite 7 + React 18 + TS, three modes (Learn / Simulate / Lab).
MVP scope: Ohm's Law and Simple Pendulum, live. The full plan is [PLAN.md](PLAN.md); licences and
provenance are [ATTRIBUTION.md](ATTRIBUTION.md).

```bash
npm install --legacy-peer-deps   # REQUIRED: plain npm install crashes on an arborist bug (npm 10.9.8)
npm run dev                      # Vite on 0.0.0.0:5173
npm run typecheck && npm run test && npm run build
```

Tailwind 3.4 with a JS config (`tailwind.config.js`) + `src/styles/globals.css`. No KaTeX —
sub/sup and Unicode only. No chart library: graphs are SVG in `src/components/charts/LabGraph.tsx`
with `d3-scale`.

## 2. Source pins (`source/`, read-only)

| Submodule | Upstream | Pin | Status |
| --- | --- | --- | --- |
| `source/physics-sims` | IlliniOpenEdu/PhysicsSims (mirror: `hamzsavai-crypto/VPL`) | `bd7144d` | reference; pendulum physics adapted |
| `source/react-bits` | DavidHDev/react-bits | `5fc9add` | 10 components vendored |
| `source/animate-ui` | imskyleen/animate-ui | `efeb96f` | patterns only, nothing installed |

All three pins are still upstream HEAD, so `git clone --recurse-submodules` works. If upstream moves
and init fails: `git -C source/<name> fetch --unshallow` (they were added with `--depth 1`).

## 3. Invariants — do not break these

1. **Physics never lives in a component.** Pure functions in `src/physics/**`, unit-tested. UI
   components read results. This is what makes calcs verifiable and reusable.
2. **One lab engine.** `ExperimentShell` + `useExperimentRun` + `AnalysisOutput`. A new experiment
   adds a definition in `src/features/experiments/experiments/` and a sim in `src/components/sim/`
   (`SIMS` registry). It must not build its own table, graph, step rail or result panel — that is how
   the upstream repos fragmented, and it is the stated architectural risk in PLAN §16.
3. **Nothing imports from `source/`.** Vite never resolves into it.
4. **Vendored React Bits files stay byte-identical to upstream.** Overrides go in
   `src/styles/bits.css` (two-class selectors, no `!important`), types in `*.d.ts` sidecars. A test
   asserts every overridden selector still exists upstream — if a re-pull renames a class, fix the
   skin, do not edit the component.
5. **One animation engine: `motion`** (import `motion/react`). `framer-motion` was deliberately
   removed. Don't reintroduce it.
6. **Reduced motion is honoured** for every continuous animation (`bits.css` `@media` block).
7 **Accounts stay deferred** (PLAN phase 7). Persistence is `localStorage`, key `vpl.attempts.v1`.

## 4. Shape of the code

- `src/physics/common/stats.ts` — least-squares, mean, sd, uncertainty.
- `src/physics/electricity/ohmsLaw.ts` — meter model (0.05 V / 2 mA resolution + 1% accuracy),
  `validateSetup`, limits, resistor bands, `analyseOhms`.
- `src/physics/mechanics/pendulum.ts` — velocity-Verlet `stepPendulum`, `advance()` → `{ state,
  cycles }` (**one cycle per full period**), period formulas, tension, energy, `analysePendulum`.
- `src/lib/lab/analysis.ts` — engine-neutral `AnalysisOutput{rows, derivedColumns, stats, graph,
  result, warnings}`. Panels render from it; the physics layer never emits JSX.
- `src/features/experiments/` — `types.ts`, `registry.ts` (live + `PLANNED_EXPERIMENTS`),
  `attempts.ts`, `useExperimentRun.ts`, per-experiment data files (`minReadings` 3, tolerance 5%).
- `src/components/lab/` — `ExperimentShell` gates Analysis + Result on `usableCount >= minReadings`,
  accepts `bootstrap` to reopen a saved attempt. `sims.tsx` maps slugs to sim components.
- Gating rule in the shell, not in each sim: a sim that over-collects is capped by the table.

## 5. Traps already paid for

- `vite.config.ts` must import `defineConfig` from **`vitest/config`** for `test`/`preview` keys;
  `allowedHosts: ['.e2b.app', '.localhost']` under **both** `server` and `preview` or the preview host
  403s (config edits rely on Vite's auto-restart — re-check the live process).
- `raw.githubusercontent.com` fetches come back empty in this sandbox. Read the pinned local checkout,
  or `gh api .../contents/<path> --jq .content | base64 -d`.
- React Bits APIs, from the source (don't re-guess): `BlurText` renders a `<p>` (so: `sr-only` real
  `<h1>` + `aria-hidden` visual, never nested in a heading); `CountUp` has **no `decimals`** prop and
  derives precision from `to`/`from`; `StarBorder` takes `as`; `DecryptedText` has **no
  `animateOn="mount"`** — `view` degrades to plain text if the observer never fires, and ships its own
  `srOnly` span; `BorderGlow` needs a **hex** `backgroundColor` (its `isLightColor()` parses hex).
- Vendored CSS hardcodes reactbits.dev demo styling (`#111`, `2rem` padding, `cursor:pointer`,
  centred flex). That is what `bits.css` exists to neutralise.
- Editing these pages with scripted patches: anchor on unique sibling text. A `replace(..., 1)` keyed
  on generic JSX (`</div>\n</motion.div>`) once closed the wrong element and produced TS17008.
- PhysicsSims counts a period as **one centre crossing**; that is wrong — it makes `g` ~4× too small.
  `PENDULUM_LIMITS` and the render tests pin the corrected behaviour.
- Ohm's `sample` includes meter error: expected slope is **101.48 Ω**, not 100. Grade against
  `tolerancePercent`, not equality.
- `tsconfig` has `noUncheckedIndexedAccess` + `strict` (bites `as const` tables → `| undefined`) and
  `allowJs` (for the `.jsx` components).

## 6. Verification state at this commit

```
npx tsc --noEmit   → clean
npx vitest run     → 5 files, 60 tests (stats 6, pendulum 10, ohmsLaw 10, render 14, bits 20)
npx vite build     → JS 456.92 kB │ gzip 150.62 kB ; CSS 38.53 kB │ gzip 7.57 kB
```
Assertions worth keeping: ideal 6-trial pendulum → `g = 9.80`, verdict `pass`; single trial →
`measured.value` null + `insufficient`; constant-length trials → warning matching
`/spread along L|vary the length/i`; exact V–I fit → slope = nominal R; curved V–I → `review` +
Linearity warning; Verlet energy drift over 4000 steps < 0.2%.

## 7. Open queue

1. **Animated backgrounds — user decision, nothing started.** Every React Bits background is WebGL
   (`Aurora`/`SoftVeil`/`DarkVeil` → `ogl`; `ColorBends`/`GridScan` → `three`, and `GridScan` also
   `face-api.js`). `DarkVeil` specifically runs an unbounded rAF shader loop with no
   `prefers-reduced-motion` check and no WebGL-failure guard. Options: (a) keep CSS gradient,
   (b) `ogl` + guarded wrapper (static fallback, opt-in, marketing surfaces only), (c) `three` for
   `ColorBends`. Recommendation: (b) if the look matters, (a) if grading matters.
2. **Phase 4: thin lens / focal length** — mirror the Ohm pattern (definition + sim + `analyse`),
   don't invent a new UI. Then projectile motion.
3. **Repo rename** `project-2` → VPL product name, and set Vite `base` if deployed to a subpath.
4. `docs/ANIMATe` note: the Unity pin was removed from `source/`; the user's `hamzsavai-crypto/ANIMATe`
   repo is untouched. Restorable with
   `git submodule add https://github.com/hamzsavai-crypto/ANIMATe.git source/animate-ui-materials`.
5. Consider a `useMeter`/reading-acceptance sound-or-haptic, and a print-to-PDF report — both cheap
   wins, neither requested yet.

## 8. Git facts

Work lives on `arena/01a0b5eb-project-2` (`1e9fd01`), which is what this Arena session tracks.
`main` is still `7586d95` (empty init commit). To fold the work into the default branch:

```bash
git push origin arena/01a0b5eb-project-2:main        # fast-forward, no PR
gh pr create --base main --head arena/01a0b5eb-project-2 --fill   # or review it as a PR
```

A new chat does **not** inherit this conversation. It does inherit this file, the repo, and the
branch — so read §3, §5 and §7 before touching anything, and update §7 as things land.
