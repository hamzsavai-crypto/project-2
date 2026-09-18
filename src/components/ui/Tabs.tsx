import { motion } from 'motion/react';
import { cn } from '@/lib/cn';

export interface TabItem {
  id: string;
  label: string;
  /** Small right-hand affordance, e.g. a reading count. */
  trailing?: string;
  locked?: boolean;
  lockReason?: string;
}

export function Tabs({
  items,
  active,
  onChange,
  layoutId = 'tab-underline',
  className,
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
  layoutId?: string;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn('flex flex-wrap items-center gap-1', className)}>
      {items.map((item) => {
        const isActive = item.id === active;
        return (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={isActive}
            title={item.locked ? item.lockReason : undefined}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
              isActive ? 'text-lab-ink' : 'text-lab-mute hover:text-lab-ink',
              item.locked && !isActive && 'opacity-60',
            )}
          >
            {isActive ? (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 -z-10 rounded-lg bg-lab-raise shadow-[inset_0_0_0_1px_rgb(var(--lab-accent)/0.35)]"
                transition={{ type: 'spring', stiffness: 480, damping: 38 }}
              />
            ) : null}
            <span className="flex items-center gap-2">
              {item.label}
              {item.trailing ? <span className="readout text-[11px]">{item.trailing}</span> : null}
              {item.locked && !isActive ? <LockIcon /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-3 opacity-70" aria-hidden>
      <path
        fill="currentColor"
        d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm3 8H9V7a3 3 0 0 1 6 0Z"
      />
    </svg>
  );
}
