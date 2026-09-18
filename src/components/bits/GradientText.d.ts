/**
 * Hand-written type surface for the vendored React Bits component in ./GradientText.jsx.
 * The implementation is copied byte-for-byte from upstream and stays that way;
 * these declarations exist so call sites are type-checked without editing it.
 */
import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from 'react';

export interface GradientTextProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  pauseOnHover?: boolean;
  yoyo?: boolean;
}

declare const _default: (props: GradientTextProps) => ReactElement;
export default _default;
