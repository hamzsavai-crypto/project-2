import { useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { Badge } from '@/components/ui/Panel';
import { Button } from '@/components/ui/Button';
import { StarBorder } from '@/components/bits';
import { createRng, hashSeed, symmetricNoise } from '@/lib/random';
import { fmt } from '@/lib/calculations/format';
import {
  currentFor,
  powerDissipated,
  readingFor,
  resistorBands,
  voltageAcrossResistor,
  validateSetup,
  METERS,
  OHMS_LIMITS,
  type OhmsSetup,
} from '@/physics/electricity/ohmsLaw';
import { clampParam, type LabSimProps } from './contract';

const BAND_HEX: Record<string, string> = {
  black: '#111318',
  brown: '#8b5a2b',
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  blue: '#3b82f6',
  violet: '#8b5cf6',
  grey: '#9ca3af',
  white: '#f8fafc',
  gold: '#d4af37',
};

/**
 * Ohm's law bench: a DC loop whose meters quantise at real instrument
 * resolution, so a recorded reading is a measurement rather than the truth.
 */
export function OhmsLawSim({ def, params, setParam, recordReading, variable }: LabSimProps) {
  const [flash, setFlash] = useState(0);
  const counter = useRef(0);

  const setup: OhmsSetup = useMemo(
    () => ({
      emfVolts: clampParam(params.emfVolts ?? 0, variable('emfVolts')),
      externalOhms: clampParam(params.externalOhms ?? 100, variable('externalOhms')),
      internalOhms: clampParam(params.internalOhms ?? 0, variable('internalOhms')),
    }),
    [params.emfVolts, params.externalOhms, params.internalOhms, variable],
  );

  const problem = validateSetup(setup);
  const amps = currentFor(setup);
  const volts = voltageAcrossResistor(setup);
  const bands = resistorBands(setup.externalOhms);

  // Dot drift speed scales with current, so the animation is itself a gauge.
  const flowSeconds = amps <= 0.0005 ? 0 : Math.min(6, Math.max(0.25, 0.05 / amps));
  const meterHot = amps > 0.5;

  const onRecord = () => {
    if (problem) return;
    counter.current += 1;
    const rng = createRng(hashSeed(def.slug, counter.current, setup.emfVolts, setup.externalOhms));
    const reading = readingFor(setup, symmetricNoise(rng), symmetricNoise(rng));
    recordReading({ voltageVolts: reading.voltageVolts, currentAmps: reading.currentAmps });
    setFlash((f) => f + 1);
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="relative flex-1 overflow-hidden rounded-lg border border-lab-line/25 bg-lab-void/60">
        <svg viewBox="0 0 640 300" className="h-full w-full">
          <defs>
            <linearGradient id="resistor-body" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#d8c9a3" />
              <stop offset="55%" stopColor="#b89f74" />
              <stop offset="100%" stopColor="#8d7a56" />
            </linearGradient>
          </defs>

          {/* loop */}
          <path
            d="M120 60 H520 A24 24 0 0 1 544 84 V216 A24 24 0 0 1 520 240 H120 A24 24 0 0 1 96 216 V84 A24 24 0 0 1 120 60 Z"
            fill="none"
            stroke="rgb(var(--lab-line))"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <path
            d="M120 60 H520 A24 24 0 0 1 544 84 V216 A24 24 0 0 1 520 240 H120 A24 24 0 0 1 96 216 V84 A24 24 0 0 1 120 60 Z"
            fill="none"
            stroke="rgb(var(--lab-accent))"
            strokeWidth="2.4"
            strokeDasharray="3 34"
            strokeLinecap="round"
            opacity={problem ? 0 : 0.95}
          >
            {flowSeconds > 0 ? (
              <animate attributeName="stroke-dashoffset" from="0" to="-370" dur={`${flowSeconds}s`} repeatCount="indefinite" />
            ) : null}
          </path>

          {/* battery */}
          <g transform="translate(300 240)">
            <line x1="-46" y1="0" x2="-10" y2="0" stroke="rgb(var(--lab-line))" strokeWidth="7" />
            <line x1="-8" y1="-26" x2="-8" y2="26" stroke="rgb(var(--lab-ink))" strokeWidth="5" />
            <line x1="10" y1="-13" x2="10" y2="13" stroke="rgb(var(--lab-ink))" strokeWidth="5" />
            <line x1="16" y1="-26" x2="16" y2="26" stroke="rgb(var(--lab-ink))" strokeWidth="5" />
            <line x1="34" y1="-13" x2="34" y2="13" stroke="rgb(var(--lab-ink))" strokeWidth="5" />
            <line x1="42" y1="0" x2="86" y2="0" stroke="rgb(var(--lab-line))" strokeWidth="7" />
            <text x="-6" y="-34" className="fill-lab-mute font-mono text-[11px]" textAnchor="end">
              +
            </text>
            <text x="52" y="-34" className="fill-lab-mute font-mono text-[11px]">
              −
            </text>
            <text x="13" y="48" className="fill-lab-mute text-[11px]" textAnchor="middle">
              supply {fmt(setup.emfVolts, 1)} V · r {fmt(setup.internalOhms, 1)} Ω
            </text>
          </g>

          {/* resistor under test */}
          <g transform="translate(544 150) rotate(90)">
            <rect x="-52" y="-15" width="104" height="30" rx="14" fill="url(#resistor-body)" />
            {[bands.digits[0], bands.digits[1], bands.multiplier, bands.tolerance].map((c, i) => (
              <rect key={i} x={-40 + i * 22} y="-15" width="9" height="30" fill={BAND_HEX[c] ?? '#888'} opacity={0.95} />
            ))}
            <text x="0" y="-24" className="fill-lab-mute text-[11px]" textAnchor="middle">
              {fmt(setup.externalOhms, 0)} Ω ±5%
            </text>
          </g>

          {/* ammeter in series (top lead) */}
          <g transform="translate(300 60)">
            <circle r="27" fill="rgb(var(--lab-panel))" stroke={meterHot ? 'rgb(var(--lab-fail))' : 'rgb(var(--lab-measure))'} strokeWidth="2" />
            <text y="-4" textAnchor="middle" className="fill-lab-ink font-mono text-[13px]">
              {fmt(amps * 1000, 0)}
            </text>
            <text y="12" textAnchor="middle" className="fill-lab-mute text-[9px]">
              mA
            </text>
            <text y="46" textAnchor="middle" className="fill-lab-mute text-[11px]">
              ammeter · A
            </text>
          </g>

          {/* voltmeter across the resistor */}
          <g transform="translate(430 150)">
            <line x1="0" y1="-90" x2="70" y2="-90" stroke="rgb(var(--lab-line))" strokeWidth="2.2" strokeDasharray="4 4" />
            <line x1="0" y1="90" x2="70" y2="90" stroke="rgb(var(--lab-line))" strokeWidth="2.2" strokeDasharray="4 4" />
            <circle r="27" fill="rgb(var(--lab-panel))" stroke="rgb(var(--lab-expect))" strokeWidth="2" />
            <text y="-4" textAnchor="middle" className="fill-lab-ink font-mono text-[13px]">
              {fmt(volts, 2)}
            </text>
            <text y="12" textAnchor="middle" className="fill-lab-mute text-[9px]">
              V
            </text>
          </g>
        </svg>

        {problem ? (
          <div className="absolute inset-x-3 bottom-3 rounded-lg border border-lab-fail/40 bg-lab-fail/10 px-3 py-2 text-xs text-lab-fail">
            {problem}
          </div>
        ) : null}

        {flash > 0 ? (
          <motion.div
            key={flash}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-3 top-3"
          >
            <Badge tone="pass">reading recorded</Badge>
          </motion.div>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <Readout label="Voltmeter V" value={volts} precision={2} unit="V" sub={`smallest division ${METERS.voltmeterStep} V`} tone="expect" />
        <Readout
          label="Ammeter I"
          value={amps * 1000}
          precision={0}
          unit="mA"
          sub={`P = ${fmt(powerDissipated(setup), 3)} W · division ${METERS.ammeterStep * 1000} mA`}
          tone={meterHot ? 'fail' : 'measure'}
        />
        <StarBorder as="div" color={problem ? '#3f4e64' : '#22d3ee'} speed="4.5s" thickness={1} className="vpl-sweep h-full">
          <Button variant="primary" onClick={onRecord} disabled={!!problem} className="h-full w-full">
            Record reading
          </Button>
        </StarBorder>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-[12px] text-lab-mute">
          Supply EMF · {fmt(setup.emfVolts, 1)} V
          <input
            type="range"
            className="mt-1.5"
            min={OHMS_LIMITS.emfVolts.min}
            max={OHMS_LIMITS.emfVolts.max}
            step={OHMS_LIMITS.emfVolts.step}
            value={setup.emfVolts}
            onChange={(e) => setParam('emfVolts', Number(e.target.value))}
          />
        </label>
        <label className="text-[12px] text-lab-mute">
          Resistor · {fmt(setup.externalOhms, 0)} Ω
          <input
            type="range"
            className="mt-1.5"
            min={OHMS_LIMITS.externalOhms.min}
            max={OHMS_LIMITS.externalOhms.max}
            step={OHMS_LIMITS.externalOhms.step}
            value={setup.externalOhms}
            onChange={(e) => setParam('externalOhms', Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}

function Readout({
  label,
  value,
  precision,
  unit,
  sub,
  tone,
}: {
  label: string;
  value: number;
  precision: number;
  unit: string;
  sub: string;
  tone: 'measure' | 'expect' | 'fail';
}) {
  const toneClass = {
    measure: 'text-lab-measure',
    expect: 'text-lab-expect',
    fail: 'text-lab-fail',
  }[tone];
  return (
    <div className="rounded-lg border border-lab-line/25 bg-lab-panel/60 px-3 py-2">
      <p className="text-[11px] uppercase tracking-[0.12em] text-lab-mute">{label}</p>
      <p className={`mt-0.5 font-mono text-2xl tabular-nums ${toneClass}`}>
        <AnimatedNumber value={value} precision={precision} />
        <span className="ml-1 text-xs text-lab-mute">{unit}</span>
      </p>
      <p className="mt-0.5 text-[10px] text-lab-mute/80">{sub}</p>
    </div>
  );
}
