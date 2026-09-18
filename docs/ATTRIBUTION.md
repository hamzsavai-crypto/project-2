# Attribution and licences

VPL is an original application. Where it adapts source material, that is recorded here at file level.

## Pinned references (`source/`)

| Path | Upstream | Commit | Licence | Used for |
| --- | --- | --- | --- | --- |
| `source/physics-sims` | [IlliniOpenEdu/PhysicsSims](https://github.com/IlliniOpenEdu/PhysicsSims) (mirrored as `hamzsavai-crypto/VPL`) | `bd7144d` | MIT | Physics and architecture reference |
| `source/react-bits` | [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) | `5fc9add` | MIT + Commons Clause v1.0 | 10 components vendored into `src/components/bits/` |
| `source/animate-ui` | [imskyleen/animate-ui](https://github.com/imskyleen/animate-ui) | `efeb96f` | MIT + Commons Clause v1.0 | interaction-pattern reference only, nothing installed |

Submodules are **reference material**: nothing in `source/` is imported by the application build,
and the Vite config never resolves into it. Where something is taken from them it is either
re-declared as VPL code (the pendulum physics) or copied with a provenance header (the React Bits
components below).

Formerly pinned here and removed: `hamzsavai-crypto/ANIMATe`, a mirror of `lgarczyn/AnimateUIMaterials` -
a Unity C#/ShaderLab package for animating Unity UI materials, which cannot contribute anything to a
React application. The repository itself is untouched; only the pin was dropped.

## Adapted code

### `src/physics/mechanics/pendulum.ts`

The velocity-Verlet step (`stepPendulum`) and the derived quantities in `advance`, `bobHeight`,
`bobSpeed`, `stringTension` and `energyJ` are adaptations of the physics inside
`source/physics-sims/src/pages/mechanics/PendulumExplorer.tsx` (© University of Illinois, MIT). In the
upstream file that mathematics sits inside a 1023-line React page; here it is re-declared as pure
functions so it can be unit-tested and driven by a stopwatch. The equations of motion, the tension
formula `m(Lω² + g·cos θ)` and the energy expressions are theirs.

`amplitudeCorrectedPeriod` is the standard first-order large-amplitude expansion
`T ≈ T₀(1 + sin²(θ₀/2)/4)`, from the physics literature rather than from either repository.

## Vendored components (`src/components/bits/`)

Copied **unmodified** from `source/react-bits/src/content/...` at `5fc9add`, each with a provenance
header naming its upstream path. Ten components, selected on one rule: no gsap, no WebGL, no
non-motion dependency, so VPL's engine count stays at one.

| Component | Category | Used for |
| --- | --- | --- |
| `BlurText` | TextAnimations | hero headline, word-by-word blur |
| `GradientText` | TextAnimations | hero accent line |
| `ShinyText` | TextAnimations | secondary status line |
| `CountUp` | TextAnimations | headline statistics, percentage error |
| `DecryptedText` | TextAnimations | result headline reveal (renders a plain-text copy for assistive tech) |
| `StarBorder` | Animations | sweeping border on Record / Save actions |
| `Magnet` | Animations | pointer attraction on primary CTAs |
| `GlareHover` | Animations | glare sweep on the home bench card |
| `SpotlightCard` | Components | pointer spotlight on experiment cards |
| `BorderGlow` | Components | edge-lit frame around the analysis graph |

Two deliberate departures from the "just paste it in" model:

1. **The `.jsx`/`.css` files are not edited.** Upstream CSS is tuned for reactbits.dev demos -
   `#111` surfaces, `1.5rem` radii, `2rem` padding, `cursor: pointer` on static text,
   `margin: 0 auto` centring. All of it is neutralised in `src/styles/bits.css` via two-class
   selectors (`.card-spotlight.vpl-card`), so the copies stay byte-identical and re-pullable while
   VPL keeps one design system. A test asserts every overridden selector still exists upstream.
2. **Types are hand-written sidecars** (`*.d.ts`) rather than a TS conversion of the components.
   Inferring props from the JS marked internal defaults like `onStart` as required; converting the
   files would have made upstream refreshes a merge conflict.

Considered and rejected, with reasons:

- `AnimatedContent`, `FadeContent`, `SplitText` - need `gsap` (+ `@gsap/react`); VPL already has
  equivalent transitions in `FadeSwap` on `motion`.
- `DotGrid` - imports `gsap/InertiaPlugin`, which is a paid Club GreenSock plugin.
- Every `Backgrounds/*` component - WebGL. `Aurora`, `SoftAurora`, `DarkVeil` need `ogl`; `ColorBends`
  and `GridScan` need `three` (and `GridScan` also `face-api.js` + `postprocessing`). Checked
  specifically: `DarkVeil` runs an unbounded `requestAnimationFrame` shader loop with no
  `prefers-reduced-motion` check and no WebGL-failure guard, which is the wrong trade for a study
  tool that may run on a school laptop. A background can be added later behind an explicit opt-in.
- `Stepper` - pure `motion`, and tempting for the step rail, but it owns navigation state
  (internal step counter with Back/Continue), which conflicts with the shell's jump-anywhere-plus-gating
  model. Not vendored, to avoid shipping an unused 253-line component.

## Deliberately not adapted

- **`src/lib/circuit/solver.ts` (modified nodal analysis)** — not re-implemented in VPL. The Ohm's-law
  experiment needs a *measurement* model (meter resolution, instrumental error, source resistance),
  not a general network solver. When the open circuit sandbox is built (Phase 6), the solver should
  be lifted intact from `source/physics-sims` rather than rewritten a second time.
- **Pages, routing, navbar/footer, hooks** — PhysicsSims' presentation layer is not copied. VPL has
  its own shell, and its own `?clean`-free single-layout design.
- **`Unity/`, `Releases/`, `Asset Store Graphics/`** in Animate UI Materials — C# and ShaderLab
  sources for a Unity package; not applicable to a React application.

## Dependency considered and not installed

**`imskyleen/animate-ui`** (© Elliot Sutton, MIT + Commons Clause v1.0) is pinned as a submodule
for reference but nothing is installed from it: it targets **Tailwind v4** (`tailwindcss ^4.1.13`,
`@tailwindcss/postcss`) while VPL is on Tailwind 3.4 with a JS config, so copy-and-paste consumption
would require migrating the styling foundation before any feature work. Its licence also permits use
inside a product but forbids redistributing the components themselves.

What was taken is behavioural, not code, and is now largely superseded by the React Bits layer:
the shared-layout tab indicator (`components/ui/Tabs.tsx`), press feedback that confirms a reading
was accepted (`Button.tsx`), and rolling numeric readouts for live instruments
(`AnimatedNumber.tsx` - deliberately *not* replaced by `CountUp`, which is a one-shot count, whereas
a meter must track a slider instantly).

## Original work

Everything else in `src/` — the experiment contract and registry, the laboratory shell and panels,
the observation table and its validation, the SVG charting surface, the Ohm's-law meter model, the
stopwatch-driven pendulum rig, the local attempt store, and all tests — is original to this project.

Upstream notices retained per MIT terms:

```
PhysicsSims - © University of Illinois Illinois Physics. MIT Licence.
React Bits - © David Haz. MIT + Commons Clause Licence Condition v1.0.
animate-ui - © 2025 Elliot Sutton. MIT + Commons Clause Licence Condition v1.0.
```

Full texts: `source/physics-sims/LICENSE`, `source/react-bits/LICENSE.md`, `source/animate-ui/LICENSE.md`.
