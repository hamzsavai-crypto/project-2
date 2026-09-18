# Attribution and licences

VPL is an original application. Where it adapts source material, that is recorded here at file level.

## Pinned references (`source/`)

| Path | Upstream | Commit | Licence | Used for |
| --- | --- | --- | --- | --- |
| `source/physics-sims` | [IlliniOpenEdu/PhysicsSims](https://github.com/IlliniOpenEdu/PhysicsSims) (mirrored as `hamzsavai-crypto/VPL`) | `bd7144d` | MIT | Physics and architecture reference |
| `source/animate-ui-materials` | [lgarczyn/AnimateUIMaterials](https://github.com/lgarczyn/AnimateUIMaterials) (mirrored as `hamzsavai-crypto/ANIMATe`) | `c7537f7` | MIT | Animation reference only — Unity C#/ShaderLab, no code reuse possible |

Both submodules are **read-only reference material**. Nothing in `source/` is imported by the
application build; the Vite `content`/`resolve` configuration never touches it.

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

### Deliberately not adapted

- **`src/lib/circuit/solver.ts` (modified nodal analysis)** — not re-implemented in VPL. The Ohm's-law
  experiment needs a *measurement* model (meter resolution, instrumental error, source resistance),
  not a general network solver. When the open circuit sandbox is built (Phase 6), the solver should
  be lifted intact from `source/physics-sims` rather than rewritten a second time.
- **Pages, routing, navbar/footer, hooks** — PhysicsSims' presentation layer is not copied. VPL has
  its own shell, and its own `?clean`-free single-layout design.
- **`Unity/`, `Releases/`, `Asset Store Graphics/`** in Animate UI Materials — C# and ShaderLab
  sources for a Unity package; not applicable to a React application.

## Dependency considered and not installed

**`imskyleen/animate-ui`** (© Elliot Sutton, *MIT + Commons Clause*) was not added as a dependency.
Two independent reasons, recorded so nobody re-litigates it:

1. It targets **Tailwind v4** while this app is on Tailwind 3.4 with a JS config; copy-and-paste
   consumption would not compile without migrating the styling foundation first.
2. Its licence permits use inside a product but forbids selling or redistributing **the components
   themselves** in original form — a constraint worth avoiding by hand-porting the handful of
   interaction patterns actually wanted.

The patterns taken are behavioural, not code: the shared-layout tab indicator, press feedback that
confirms a reading was accepted, rolling numeric readouts, and fade/slide transitions between
laboratory steps. All were written against framer-motion, which PhysicsSims and VPL already share.

## Original work

Everything else in `src/` — the experiment contract and registry, the laboratory shell and panels,
the observation table and its validation, the SVG charting surface, the Ohm's-law meter model, the
stopwatch-driven pendulum rig, the local attempt store, and all tests — is original to this project.

Upstream notices retained per MIT terms:

```
PhysicsSims — © University of Illinois Illinois Physics. MIT Licence.
AnimateUIMaterials — © 2023 Lou Garczynski. MIT Licence.
```

Full texts: `source/physics-sims/LICENSE`, `source/animate-ui-materials/LICENSE`.
