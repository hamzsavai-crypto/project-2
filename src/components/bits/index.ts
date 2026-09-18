/**
 * Typed entry points for the components vendored from React Bits.
 *
 * The `.jsx`/`.css` files alongside this barrel are copied **unmodified** from
 * `source/react-bits` (DavidHDev/react-bits @ 5fc9add) so that they stay
 * diffable against upstream and can be refreshed mechanically. Anything VPL-specific
 * about how they look lives in `src/styles/bits.css`, and anything about how they
 * behave for a laboratory lives in the components that consume them.
 *
 * Skipped on purpose, with reasons in docs/ATTRIBUTION.md: AnimatedContent,
 * FadeContent, SplitText and DotGrid (gsap, incl. the non-free InertiaPlugin) and
 * every background component (WebGL via ogl/three).
 */
export { default as BlurText } from './BlurText.jsx';
export { default as BorderGlow } from './BorderGlow.jsx';
export { default as CountUp } from './CountUp.jsx';
export { default as DecryptedText } from './DecryptedText.jsx';
export { default as GlareHover } from './GlareHover.jsx';
export { default as GradientText } from './GradientText.jsx';
export { default as Magnet } from './Magnet.jsx';
export { default as ShinyText } from './ShinyText.jsx';
export { default as SpotlightCard } from './SpotlightCard.jsx';
export { default as StarBorder } from './StarBorder.jsx';
