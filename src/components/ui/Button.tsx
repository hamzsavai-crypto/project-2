import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary: 'bg-lab-accent text-lab-void hover:bg-lab-accent/90 shadow-[0_0_0_1px_rgb(var(--lab-accent)/0.4)]',
  secondary: 'bg-lab-raise text-lab-ink border border-lab-line/40 hover:border-lab-accent/50 hover:text-lab-accent',
  ghost: 'text-lab-mute hover:text-lab-ink hover:bg-lab-raise/70',
  danger: 'text-lab-fail border border-lab-fail/40 hover:bg-lab-fail/10',
};

const SIZES: Record<ButtonSize, string> = {
  sm: 'h-8 px-2.5 text-xs',
  md: 'h-10 px-4 text-sm',
};

/**
 * Motion here is functional, not decorative: the press feedback tells the
 * student the reading was accepted. Patterns hand-ported from the Animate UI
 * component set to this project's Tailwind v3 setup.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', className, disabled, children, ...rest },
  ref,
) {
  return (
    <motion.button
      ref={ref}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      whileHover={disabled ? undefined : { y: -1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 26 }}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:y-0',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      disabled={disabled}
      {...(rest as Record<string, unknown>)}
    >
      {children}
    </motion.button>
  );
});
