/**
 * Hand-written type surface for the vendored React Bits component in ./CountUp.jsx.
 * The implementation is copied byte-for-byte from upstream and stays that way;
 * these declarations exist so call sites are type-checked without editing it.
 */
import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from 'react';

export interface CountUpProps {
  to: number;
  from?: number;
  /** 'up' | 'down' */
  direction?: string;
  delay?: number;
  duration?: number;
  className?: string;
  /** true = animate on mount; otherwise waits for the element to scroll into view. */
  startWhen?: boolean;
  separator?: string;
  onStart?: () => void;
  onEnd?: () => void;
}

declare const _default: (props: CountUpProps) => ReactElement;
export default _default;
