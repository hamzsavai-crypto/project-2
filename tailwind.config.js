/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // One design system, consumed everywhere as semantic tokens rather than
        // raw palette names, so a light theme later is a CSS-variable change only.
        lab: {
          void: 'rgb(var(--lab-void) / <alpha-value>)',
          panel: 'rgb(var(--lab-panel) / <alpha-value>)',
          raise: 'rgb(var(--lab-raise) / <alpha-value>)',
          line: 'rgb(var(--lab-line) / <alpha-value>)',
          ink: 'rgb(var(--lab-ink) / <alpha-value>)',
          mute: 'rgb(var(--lab-mute) / <alpha-value>)',
          accent: 'rgb(var(--lab-accent) / <alpha-value>)',
          measure: 'rgb(var(--lab-measure) / <alpha-value>)',
          expect: 'rgb(var(--lab-expect) / <alpha-value>)',
          pass: 'rgb(var(--lab-pass) / <alpha-value>)',
          fail: 'rgb(var(--lab-fail) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 0 rgb(255 255 255 / 0.04) inset, 0 18px 40px -24px rgb(0 0 0 / 0.9)',
      },
    },
  },
  plugins: [],
};
