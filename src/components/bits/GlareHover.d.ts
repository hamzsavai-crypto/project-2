/**
 * Hand-written type surface for the vendored React Bits component in ./GlareHover.jsx.
 * The implementation is copied byte-for-byte from upstream and stays that way;
 * these declarations exist so call sites are type-checked without editing it.
 */
import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from 'react';

export interface GlareHoverProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  width?: string;
  height?: string;
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  glareSize?: number;
  transitionDuration?: number;
  playOnce?: boolean;
}

declare const _default: (props: GlareHoverProps) => ReactElement;
export default _default;
