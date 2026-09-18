/**
 * Hand-written type surface for the vendored React Bits component in ./BorderGlow.jsx.
 * The implementation is copied byte-for-byte from upstream and stays that way;
 * these declarations exist so call sites are type-checked without editing it.
 */
import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from 'react';

export interface BorderGlowProps {
  children?: ReactNode;
  className?: string;
  edgeSensitivity?: number;
  glowColor?: string;
  backgroundColor?: string;
  borderRadius?: number;
  glowRadius?: number;
  glowIntensity?: number;
  coneSpread?: number;
  animated?: boolean | 'sweep';
  colors?: string[];
  fillOpacity?: number;
}

declare const _default: (props: BorderGlowProps) => ReactElement;
export default _default;
