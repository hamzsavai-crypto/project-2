/**
 * Guards for the vendored React Bits layer. Two things are easy to break here:
 * a component that throws during render (the app would white-screen), and the
 * skin layer silently detaching from the upstream class names, which would put
 * #111 panels and 2rem padding back into a laboratory UI.
 */
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  BlurText,
  BorderGlow,
  CountUp,
  DecryptedText,
  GlareHover,
  GradientText,
  Magnet,
  ShinyText,
  SpotlightCard,
  StarBorder,
} from '@/components/bits';

const cases: [string, () => JSX.Element][] = [
  ['BlurText', () => <BlurText text="Measure once" animateBy="words" />],
  ['CountUp', () => <CountUp to={9.81} duration={1} />],
  ['ShinyText', () => <ShinyText text="no install required" />],
  ['GradientText', () => <GradientText colors={['#22d3ee', '#818cf8']}>Perform it.</GradientText>],
  ['DecryptedText', () => <DecryptedText text="g = 9.78 m/s2" animateOn="view" />],
  ['StarBorder', () => <StarBorder as="div">Record reading</StarBorder>],
  ['SpotlightCard', () => <SpotlightCard className="vpl-card">card</SpotlightCard>],
  ['GlareHover', () => <GlareHover width="100%" height="100%" className="vpl-surface">bench</GlareHover>],
  ['BorderGlow', () => <BorderGlow backgroundColor="#0f1520" className="vpl-instrument">graph</BorderGlow>],
  ['Magnet', () => <Magnet padding={80}>start</Magnet>],
];

describe('vendored React Bits components', () => {
  for (const [name, factory] of cases) {
    it(`${name} renders without throwing`, () => {
      expect(renderToStaticMarkup(factory()).length).toBeGreaterThan(0);
    });
  }

  it('keeps the accessible string readable when text is animated', () => {
    // DecryptedText renders a screen-reader copy plus an aria-hidden visual copy.
    const html = renderToStaticMarkup(<DecryptedText text="Resistance = 100.4 ohms" animateOn="view" />);
    expect(html).toContain('Resistance = 100.4 ohms');
    expect(html).toContain('aria-hidden');
  });
});

describe('skin layer coupling', () => {
  const skin = readFileSync(new URL('../styles/bits.css', import.meta.url), 'utf8');

  /** Every selector the skin overrides must still exist in the vendored CSS/JSX. */
  const overridden = ['card-spotlight', 'animated-gradient-text', 'shiny-text', 'star-border-container', 'inner-content', 'glare-hover', 'border-glow-card', 'border-glow-inner'];
  for (const selector of overridden) {
    it(`targets .${selector}, which upstream still emits`, () => {
      expect(skin).toContain(`.${selector}`);
      const source = readFileSync(new URL(`../components/bits/${selector === 'inner-content' ? 'StarBorder' : selector === 'border-glow-inner' ? 'BorderGlow' : selector === 'animated-gradient-text' ? 'GradientText' : selector === 'card-spotlight' ? 'SpotlightCard' : selector === 'star-border-container' ? 'StarBorder' : selector === 'shiny-text' ? 'ShinyText' : selector === 'glare-hover' ? 'GlareHover' : 'BorderGlow'}.css`, import.meta.url), 'utf8');
      expect(source).toContain(`.${selector}`);
    });
  }

  it('disables the continuous animations under prefers-reduced-motion', () => {
    expect(skin).toMatch(/prefers-reduced-motion/);
    expect(skin).toMatch(/animation: none/);
  });
});
