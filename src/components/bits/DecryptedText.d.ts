/**
 * Hand-written type surface for the vendored React Bits component in ./DecryptedText.jsx.
 * The implementation is copied byte-for-byte from upstream and stays that way;
 * these declarations exist so call sites are type-checked without editing it.
 */
import type { CSSProperties, HTMLAttributes, ReactElement, ReactNode } from 'react';

export interface DecryptedTextProps extends HTMLAttributes<HTMLSpanElement> {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  /** 'view' starts already decrypted and re-scrambles when scrolled into view. */
  animateOn?: 'view' | 'hover' | 'click' | 'inViewHover';
  clickMode?: 'once' | 'repeat';
}

declare const _default: (props: DecryptedTextProps) => ReactElement;
export default _default;
