import { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useTransform } from 'motion/react';

/**
 * Rolling numeric readout. Used wherever an instrument value changes while the
 * student drags a control, so the eye can follow it.
 */
export function AnimatedNumber({
  value,
  precision = 2,
  className,
  suffix,
}: {
  value: number;
  precision?: number;
  className?: string;
  suffix?: string;
}) {
  const safe = Number.isFinite(value) ? value : 0;
  const mv = useMotionValue(safe);
  const text = useTransform(mv, (v) => v.toFixed(precision));
  const first = useRef(true);

  useEffect(() => {
    // No spring on mount - the bench should not animate from zero on page load.
    if (first.current) {
      first.current = false;
      mv.set(safe);
      return;
    }
    const controls = animate(mv, safe, { duration: 0.4, ease: 'easeOut' });
    return () => controls.stop();
  }, [safe, mv]);

  return (
    <span className={className}>
      <motion.span>{text}</motion.span>
      {suffix ? <span className="opacity-70">{suffix}</span> : null}
    </span>
  );
}
