import { cn } from '@/lib/cn';
import { fmt } from '@/lib/calculations/format';
import type { VariableDef } from '@/features/experiments/types';

/** One adjustable experimental parameter: slider, stepper, or fixed by the rig. */
export function VariableControl({
  def,
  value,
  onChange,
}: {
  def: VariableDef;
  value: number;
  onChange: (value: number) => void;
}) {
  const clamped = Math.min(def.max, Math.max(def.min, value));
  const isStepper = def.kind === 'stepper';

  return (
    <div className={cn('rounded-lg border border-lab-line/20 bg-lab-void/40 p-3', def.readOnly && 'opacity-70')}>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={`${def.key}-input`} className="text-[13px] font-medium text-lab-ink">
          {def.label}
        </label>
        <span className="readout">
          {fmt(clamped, decimalsFor(def.step))}
          {def.unit ? <span className="ml-0.5 text-lab-mute">{def.unit}</span> : null}
        </span>
      </div>

      {def.readOnly ? (
        <p className="mt-2 text-[11px] text-lab-mute">{def.hint}</p>
      ) : isStepper ? (
        <div className="mt-2 flex items-center gap-2">
          <StepButton label="−" onClick={() => onChange(clampTo(clamped - def.step, def))} />
          <span className="readout min-w-10 text-center text-sm">{clamped}</span>
          <StepButton label="+" onClick={() => onChange(clampTo(clamped + def.step, def))} />
          <span className="ml-auto text-[11px] text-lab-mute">{def.hint}</span>
        </div>
      ) : (
        <>
          <input
            id={`${def.key}-input`}
            type="range"
            className="mt-3"
            min={def.min}
            max={def.max}
            step={def.step}
            value={clamped}
            onChange={(e) => onChange(clampTo(Number(e.target.value), def))}
          />
          <div className="mt-1.5 flex items-center justify-between text-[10px] tabular-nums text-lab-mute/80">
            <span>
              {fmt(def.min, decimalsFor(def.step))} {def.unit}
            </span>
            {def.hint ? <span className="px-2 text-center">{def.hint}</span> : null}
            <span>
              {fmt(def.max, decimalsFor(def.step))} {def.unit}
            </span>
          </div>
        </>
      )}
    </div>
  );
}

function StepButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label === '−' ? 'decrease' : 'increase'}
      className="size-7 rounded-md border border-lab-line/40 bg-lab-raise text-sm text-lab-ink transition hover:border-lab-accent/60 hover:text-lab-accent"
    >
      {label}
    </button>
  );
}

function clampTo(value: number, def: VariableDef): number {
  if (!Number.isFinite(value)) return def.default;
  return Math.round(Math.min(def.max, Math.max(def.min, value)) / def.step) * def.step;
}

function decimalsFor(step: number): number {
  if (step >= 1) return 0;
  if (step >= 0.1) return 1;
  if (step >= 0.01) return 2;
  return 3;
}
