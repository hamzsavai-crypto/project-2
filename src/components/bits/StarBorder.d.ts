/**
 * Hand-written type surface for the vendored React Bits component in ./StarBorder.jsx.
 * The implementation is copied byte-for-byte from upstream and stays that way;
 * these declarations exist so call sites are type-checked without editing it.
 */
import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from 'react';

export interface StarBorderProps {
  /** Wrapper element; upstream defaults to 'button'. */
  as?: 'button' | 'div' | 'span' | 'a';
  children?: ReactNode;
  className?: string;
  color?: string;
  /** Sweep duration, as a CSS time string. */
  speed?: string;
  thickness?: number;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  style?: CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

declare const _default: (props: StarBorderProps) => ReactElement;
export default _default;
