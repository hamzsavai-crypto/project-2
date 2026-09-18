/**
 * Hand-written type surface for the vendored React Bits component in ./Magnet.jsx.
 * The implementation is copied byte-for-byte from upstream and stays that way;
 * these declarations exist so call sites are type-checked without editing it.
 */
import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from 'react';

export interface MagnetProps {
  children?: ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  activeTransition?: string;
  inactiveTransition?: string;
  wrapperClassName?: string;
  innerClassName?: string;
  style?: CSSProperties;
}

declare const _default: (props: MagnetProps) => ReactElement;
export default _default;
