import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/cn';

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('panel', className)}>{children}</section>;
}

export function PanelHeader({
  eyebrow,
  title,
  actions,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn('flex items-start justify-between gap-4 border-b border-lab-line/20 px-4 py-3', className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="rule-label">{eyebrow}</p> : null}
        <h2 className="truncate text-sm font-semibold text-lab-ink">{title}</h2>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

/** Cross-fade used for every laboratory step transition (plan §11). */
export function FadeSwap({ children, axisKey }: { children: ReactNode; axisKey: string }) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={axisKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export function Badge({
  children,
  tone = 'neutral',
  className,
}: {
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'pass' | 'fail' | 'measure';
  className?: string;
}) {
  const tones = {
    neutral: 'border-lab-line/40 text-lab-mute',
    accent: 'border-lab-accent/40 text-lab-accent bg-lab-accent/10',
    pass: 'border-lab-pass/40 text-lab-pass bg-lab-pass/10',
    fail: 'border-lab-fail/40 text-lab-fail bg-lab-fail/10',
    measure: 'border-lab-measure/40 text-lab-measure bg-lab-measure/10',
  } as const;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium tabular-nums',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
