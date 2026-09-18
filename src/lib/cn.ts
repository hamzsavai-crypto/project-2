/** Minimal class joiner. No dependency needed: these tokens never conflict. */
export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(' ');
}
