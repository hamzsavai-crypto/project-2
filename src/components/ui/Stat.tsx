import { cn } from '@/lib/cn';
import { fmt } from '@/lib/calculations/format';
import type { StatDef } from '@/lib/lab/analysis';

/** A single computed quantity in the analysis strip. */
export function Stat({ stat, emphasis = false }: { stat: StatDef; emphasis?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-lg border px-3 py-2',
        emphasis
          ? 'border-lab-accent/40 bg-lab-accent/5'
          : 'border-lab-line/20 bg-lab-void/40',
      )}
    >
      <p className="text-[11px] leading-tight text-lab-mute">{stat.label}</p>
      <p className="mt-1 flex items-baseline gap-1">
        <span className={cn('font-mono tabular-nums', emphasis ? 'text-lg' : 'text-base', 'text-lab-ink')}>
          {fmt(stat.value, stat.precision)}
        </span>
        {stat.unit ? <span className="text-[11px] text-lab-mute">{stat.unit}</span> : null}
      </p>
      {stat.note ? <p className="mt-0.5 text-[10px] leading-snug text-lab-mute/70">{stat.note}</p> : null}
    </div>
  );
}
