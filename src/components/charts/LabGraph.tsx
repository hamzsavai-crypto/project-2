import { useMemo, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import type { GraphDef, GraphPoint } from '@/lib/lab/analysis';
import { cn } from '@/lib/cn';
import { fmtCompact } from '@/lib/calculations/format';

const W = 720;
const H = 440;
const M = { top: 18, right: 18, bottom: 54, left: 66 };

/**
 * Minimal lab plotting surface: gridlines, zero-anchored axes, scatter points,
 * fit/theory lines, and a crosshair readout. Hand-rolled SVG on purpose -
 * pulling in a charting library for two graph types would add more surface
 * area than it saves, and this keeps the axes looking like an instrument.
 */
export function LabGraph({ def, className }: { def: GraphDef; className?: string }) {
  const [hover, setHover] = useState<GraphPoint | null>(null);

  const geometry = useMemo(() => {
    const all = def.series.flatMap((s) => s.points);
    if (all.length === 0) return null;
    const xRaw = Math.max(...all.map((p) => p.x));
    const yRaw = Math.max(...all.map((p) => p.y));
    const xMin = Math.min(0, ...all.map((p) => p.x));
    const yMin = Math.min(0, ...all.map((p) => p.y));

    const x = scaleLinear().domain([xMin, xRaw || 1]).range([M.left, W - M.right]).nice();
    const y = scaleLinear().domain([yMin, yRaw || 1]).range([H - M.bottom, M.top]).nice();
    return { x, y, xTicks: x.ticks(6), yTicks: y.ticks(5) };
  }, [def]);

  if (!geometry) {
    return (
      <div className={cn('flex aspect-[8/5] items-center justify-center rounded-lg border border-dashed border-lab-line/30 text-sm text-lab-mute', className)}>
        Take at least two readings to see a graph.
      </div>
    );
  }

  const { x, y, xTicks, yTicks } = geometry;
  const plotLeft = M.left;
  const plotRight = W - M.right;
  const plotTop = M.top;
  const plotBottom = H - M.bottom;

  return (
    <figure className={cn('m-0', className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none"
        role="img"
        aria-label={`${def.yLabel} against ${def.xLabel}`}
        onMouseLeave={() => setHover(null)}
      >
        <rect x={plotLeft} y={plotTop} width={plotRight - plotLeft} height={plotBottom - plotTop} fill="rgb(var(--lab-void)/0.55)" />

        {yTicks.map((t) => (
          <g key={`gy-${t}`}>
            <line x1={plotLeft} x2={plotRight} y1={y(t)} y2={y(t)} stroke="rgb(var(--lab-line)/0.28)" strokeWidth={t === 0 ? 1.4 : 1} />
            <text x={plotLeft - 10} y={y(t)} textAnchor="end" dominantBaseline="middle" className="fill-lab-mute font-mono text-[11px]">
              {fmtCompact(t, 3)}
            </text>
          </g>
        ))}
        {xTicks.map((t) => (
          <g key={`gx-${t}`}>
            <line x1={x(t)} x2={x(t)} y1={plotTop} y2={plotBottom} stroke="rgb(var(--lab-line)/0.22)" strokeWidth={t === 0 ? 1.4 : 1} />
            <text x={x(t)} y={plotBottom + 18} textAnchor="middle" className="fill-lab-mute font-mono text-[11px]">
              {fmtCompact(t, 3)}
            </text>
          </g>
        ))}

        {def.series
          .filter((s) => s.kind === 'line')
          .map((s) => (
            <polyline
              key={s.label}
              fill="none"
              stroke={s.tone === 'expect' ? 'rgb(var(--lab-expect))' : 'rgb(var(--lab-accent))'}
              strokeWidth={1.8}
              strokeDasharray="7 5"
              points={s.points.map((p) => `${x(p.x)},${y(p.y)}`).join(' ')}
            />
          ))}

        {def.series
          .filter((s) => s.kind === 'scatter')
          .map((s) =>
            s.points.map((p, i) => (
              <g key={`${s.label}-${i}`} onMouseEnter={() => setHover(p)}>
                <circle cx={x(p.x)} cy={y(p.y)} r={11} fill="transparent" />
                <circle
                  cx={x(p.x)}
                  cy={y(p.y)}
                  r={hover === p ? 6.5 : 4.6}
                  fill="rgb(var(--lab-measure))"
                  stroke="rgb(var(--lab-void))"
                  strokeWidth={1.6}
                />
              </g>
            )),
          )}

        {hover ? (
          <g transform={`translate(${Math.min(x(hover.x) + 12, plotRight - 152)}, ${Math.max(y(hover.y) - 40, plotTop + 4)})`}>
            <rect width={146} height={38} rx={7} fill="rgb(var(--lab-raise)/0.96)" stroke="rgb(var(--lab-line)/0.5)" />
            <text x={9} y={16} className="fill-lab-ink font-mono text-[11px]">
              {def.xLabel}: {fmtCompact(hover.x, 3)} {def.xUnit ?? ''}
            </text>
            <text x={9} y={30} className="fill-lab-measure font-mono text-[11px]">
              {def.yLabel}: {fmtCompact(hover.y, 3)} {def.yUnit ?? ''}
            </text>
          </g>
        ) : null}

        <text x={(plotLeft + plotRight) / 2} y={H - 14} textAnchor="middle" className="fill-lab-mute text-[12px] font-medium">
          {def.xLabel}
          {def.xUnit ? ` / ${def.xUnit}` : ''}
        </text>
        <text
          x={16}
          y={(plotTop + plotBottom) / 2}
          textAnchor="middle"
          transform={`rotate(-90 16 ${(plotTop + plotBottom) / 2})`}
          className="fill-lab-mute text-[12px] font-medium"
        >
          {def.yLabel}
          {def.yUnit ? ` / ${def.yUnit}` : ''}
        </text>
      </svg>

      <figcaption className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-lab-line/20 pt-2 text-[11px] text-lab-mute">
        {def.series.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span
              className={cn('inline-block h-0.5 w-4 rounded', s.kind === 'line' ? 'bg-lab-expect' : 'bg-lab-measure')}
              aria-hidden
            />
            {s.label}
          </span>
        ))}
        {def.caption ? <span className="basis-full text-lab-mute/70">{def.caption}</span> : null}
      </figcaption>
    </figure>
  );
}
