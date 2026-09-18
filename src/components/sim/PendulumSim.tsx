import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { fmt } from '@/lib/calculations/format';
import { advance, bobSpeed, energyJ, PENDULUM_LIMITS, releaseAngleRad, stringTension } from '@/physics/mechanics/pendulum';
import type { PendulumState } from '@/physics/mechanics/pendulum';
import { clampParam, type LabSimProps } from './contract';

type Phase = 'idle' | 'running' | 'timing';

const PIVOT = { x: 320, y: 44 };
const PX_PER_M = 168;

/**
 * Pendulum rig with a real stopwatch workflow: the student releases the bob,
 * asks for a timing run, and the rig starts counting at the next centre
 * crossing and stops itself after N complete oscillations - which is the
 * entire pedagogical point of the experiment.
 */
export function PendulumSim({ def, params, setParam, recordReading, variable }: LabSimProps) {
  const lengthM = clampParam(params.lengthM ?? 0.8, variable('lengthM'));
  const massKg = clampParam(params.massKg ?? 0.2, variable('massKg'));
  const angleDeg = clampParam(params.releaseAngleDeg ?? 8, variable('releaseAngleDeg'));
  const oscillations = Math.max(1, Math.round(clampParam(params.oscillations ?? 20, variable('oscillations'))));
  const gravity = params.gravity ?? 9.8;

  const [phase, setPhase] = useState<Phase>('idle');
  const [lastResult, setLastResult] = useState<{ totalTimeS: number; period: number } | null>(null);
  const [live, setLive] = useState({ elapsed: 0, cycles: 0, theta: releaseAngleRad(angleDeg) });

  const stateRef = useRef<PendulumState>({ theta: releaseAngleRad(angleDeg), omega: 0, time: 0 });
  const pendingRef = useRef(false);
  const startRef = useRef(0);
  const cyclesRef = useRef(0);
  const rafRef = useRef(0);
  const lastTickRef = useRef(0);
  const bobRef = useRef<SVGCircleElement | null>(null);
  const rodRef = useRef<SVGLineElement | null>(null);
  const paramsRef = useRef({ lengthM, gravity, massKg, damping: 0 });

  paramsRef.current = { lengthM, gravity, massKg, damping: 0 };

  const resetToRelease = useCallback(
    (angleOverride?: number) => {
      const theta = releaseAngleRad(angleOverride ?? angleDeg);
      stateRef.current = { theta, omega: 0, time: 0 };
      pendingRef.current = false;
      cyclesRef.current = 0;
      setLive({ elapsed: 0, cycles: 0, theta });
      setPhase('idle');
    },
    [angleDeg],
  );

  // Reposition the rig whenever the length or angle changes while at rest.
  useEffect(() => {
    if (phase === 'idle') resetToRelease();
  }, [lengthM, angleDeg, phase, resetToRelease]);

  useEffect(() => {
    if (phase === 'idle') return;
    let mounted = true;

    const frame = (now: number) => {
      if (!mounted) return;
      const prev = lastTickRef.current || now;
      const dt = Math.min(0.05, (now - prev) / 1000);
      lastTickRef.current = now;

      const { state: next, cycles } = advance(stateRef.current, paramsRef.current, dt);
      stateRef.current = next;

      if (pendingRef.current) {
        // Arm the clock at the centre of the swing, where the bob is fastest
        // and a human can call the crossing; each later crossing is one period.
        if (cycles > 0) {
          pendingRef.current = false;
          startRef.current = next.time;
          cyclesRef.current = 0;
        }
      } else if (phase === 'timing') {
        cyclesRef.current += cycles;
        if (cyclesRef.current >= oscillations) {
          const totalTimeS = Math.round((next.time - startRef.current) * 100) / 100;
          const period = totalTimeS / oscillations;
          recordReading({ lengthM, oscillations, totalTimeS });
          setLastResult({ totalTimeS, period });
          setPhase('running');
          cyclesRef.current = 0;
        }
      }

      const rad = paramsRef.current.lengthM * PX_PER_M;
      const x = PIVOT.x + rad * Math.sin(next.theta);
      const y = PIVOT.y + rad * Math.cos(next.theta);
      bobRef.current?.setAttribute('cx', x.toFixed(2));
      bobRef.current?.setAttribute('cy', y.toFixed(2));
      rodRef.current?.setAttribute('x2', x.toFixed(2));
      rodRef.current?.setAttribute('y2', y.toFixed(2));

      setLive((l) => {
        const elapsed = pendingRef.current ? 0 : Math.max(0, next.time - (startRef.current || next.time));
        return { elapsed, cycles: cyclesRef.current, theta: next.theta };
      });

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      lastTickRef.current = 0;
    };
  }, [phase, oscillations, recordReading, lengthM, def.slug]);

  const snapshot = useMemo(() => {
    const s = stateRef.current;
    return {
      speed: bobSpeed(lengthM, s.omega),
      tension: stringTension(lengthM, massKg, s.theta, s.omega, gravity),
      energy: energyJ(lengthM, massKg, s.theta, s.omega, gravity),
    };
    // Recomputed on every live tick via `live.theta` below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lengthM, massKg, gravity, live.theta]);

  const rad = lengthM * PX_PER_M;
  const releaseTheta = releaseAngleRad(angleDeg);
  const arcPath = useMemo(() => {
    const from = { x: PIVOT.x + rad * Math.sin(-releaseTheta), y: PIVOT.y + rad * Math.cos(-releaseTheta) };
    const to = { x: PIVOT.x + rad * Math.sin(releaseTheta), y: PIVOT.y + rad * Math.cos(releaseTheta) };
    return `M ${from.x} ${from.y} A ${rad} ${rad} 0 0 0 ${to.x} ${to.y}`;
  }, [rad, releaseTheta]);

  const progress = phase === 'timing' ? Math.min(1, live.cycles / oscillations) : 0;

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="relative flex-1 overflow-hidden rounded-lg border border-lab-line/25 bg-lab-void/60">
        <svg viewBox="0 0 640 330" className="h-full w-full">
          {/* stand */}
          <rect x="180" y="26" width="280" height="10" rx="4" fill="rgb(var(--lab-line))" />
          <rect x="300" y="10" width="40" height="20" rx="4" fill="rgb(var(--lab-raise))" stroke="rgb(var(--lab-line))" />
          <line x1={PIVOT.x} y1={PIVOT.y} x2={PIVOT.x} y2={PIVOT.y + rad + 40} stroke="rgb(var(--lab-line)/0.5)" strokeWidth="1" strokeDasharray="4 6" />

          <path d={arcPath} fill="none" stroke="rgb(var(--lab-expect)/0.45)" strokeWidth="1.4" strokeDasharray="3 5" />

          <line ref={rodRef} x1={PIVOT.x} y1={PIVOT.y} x2={PIVOT.x + rad * Math.sin(releaseTheta)} y2={PIVOT.y + rad * Math.cos(releaseTheta)} stroke="rgb(var(--lab-ink)/0.75)" strokeWidth="1.6" />
          <circle ref={bobRef} cx={PIVOT.x + rad * Math.sin(releaseTheta)} cy={PIVOT.y + rad * Math.cos(releaseTheta)} r={9 + massKg * 6} fill="rgb(var(--lab-accent))" stroke="rgb(var(--lab-void))" strokeWidth="1.5" />
          <circle cx={PIVOT.x} cy={PIVOT.y} r="4" fill="rgb(var(--lab-ink))" />

          <text x={PIVOT.x + 12} y={PIVOT.y + rad / 2} className="fill-lab-mute font-mono text-[11px]">
            L = {fmt(lengthM, 2)} m
          </text>
          <text x="16" y="322" className="fill-lab-mute font-mono text-[11px]">
            θ₀ {fmt(angleDeg, 0)}° · m {fmt(massKg, 2)} kg
          </text>
        </svg>

        <div className="absolute right-3 top-3 w-[186px] rounded-lg border border-lab-line/30 bg-lab-panel/85 p-2.5 backdrop-blur">
          <p className="text-[10px] uppercase tracking-[0.14em] text-lab-mute">stopwatch</p>
          <p className="font-mono text-2xl tabular-nums text-lab-measure">
            {fmt(live.elapsed, 2)}
            <span className="ml-1 text-xs text-lab-mute">s</span>
          </p>
          <div className="mt-1.5 h-1 overflow-hidden rounded bg-lab-line/30">
            <div className="h-full rounded bg-lab-accent transition-[width] duration-100" style={{ width: `${progress * 100}%` }} />
          </div>
          <p className="mt-1 text-[11px] tabular-nums text-lab-mute">
            {phase === 'timing'
              ? live.cycles === 0
                ? 'waiting for centre crossing…'
                : `${live.cycles} of ${oscillations} oscillations`
              : `N = ${oscillations} per trial`}
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
        <div className="rounded-lg border border-lab-line/25 bg-lab-panel/60 px-3 py-2">
          <p className="text-[11px] uppercase tracking-[0.12em] text-lab-mute">live values</p>
          <p className="mt-1 font-mono text-[12px] tabular-nums text-lab-ink">
            θ {fmt((live.theta * 180) / Math.PI, 1)}° · v {fmt(snapshot.speed, 2)} m/s
          </p>
          <p className="font-mono text-[12px] tabular-nums text-lab-ink">
            T {fmt(snapshot.tension, 2)} N · E {fmt(snapshot.energy.total, 3)} J
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          {phase === 'idle' ? (
            <Button variant="primary" onClick={() => { lastTickRef.current = 0; setPhase('running'); }}>
              Release bob
            </Button>
          ) : (
            <Button onClick={() => setPhase('idle')}>{phase === 'timing' ? 'Abort run' : 'Pause'}</Button>
          )}
          {phase === 'running' ? (
            <Button
              variant="secondary"
              onClick={() => {
                pendingRef.current = true;
                cyclesRef.current = 0;
                setPhase('timing');
              }}
            >
              Start timing
            </Button>
          ) : null}
          <Button variant="ghost" onClick={() => { resetToRelease(); setLastResult(null); }}>
            Reset
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <LabeledRange label="Length L" unit="m" {...PENDULUM_LIMITS.lengthM} value={lengthM} onChange={(v) => setParam('lengthM', v)} />
        <LabeledRange label="Release angle" unit="°" {...PENDULUM_LIMITS.releaseAngleDeg} value={angleDeg} onChange={(v) => setParam('releaseAngleDeg', v)} />
        <LabeledRange label="Bob mass" unit="kg" {...PENDULUM_LIMITS.massKg} value={massKg} onChange={(v) => setParam('massKg', v)} />
      </div>

      {lastResult ? (
        <p className="text-[11px] text-lab-pass">
          Recorded: t = {fmt(lastResult.totalTimeS, 2)} s for {oscillations} oscillations → T = {fmt(lastResult.period, 3)} s
        </p>
      ) : (
        <p className="text-[11px] text-lab-mute">
          Press <span className="text-lab-ink">Start timing</span> and the clock begins at the next centre crossing, stopping automatically after {oscillations} swings.
        </p>
      )}
    </div>
  );
}

function LabeledRange({
  label,
  unit,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="text-[12px] text-lab-mute">
      {label} · <span className="font-mono text-lab-ink">{fmt(value, step < 0.1 ? 2 : step < 1 ? 1 : 0)}</span> {unit}
      <input type="range" className="mt-1.5" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}
