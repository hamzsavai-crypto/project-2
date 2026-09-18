/**
 * Hand-written type surface for the vendored React Bits component in ./BlurText.jsx.
 * The implementation is copied byte-for-byte from upstream and stays that way;
 * these declarations exist so call sites are type-checked without editing it.
 */
import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from 'react';

export interface BlurTextProps {
  text?: string;
  /** 'words' | 'letters' */
  animateBy?: string;
  /** 'top' | 'bottom' */
  direction?: string;
  delay?: number;
  stepDuration?: number;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  animationFrom?: Record<string, unknown>;
  animationTo?: Record<string, unknown>[];
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
}

declare const _default: (props: BlurTextProps) => ReactElement;
export default _default;
