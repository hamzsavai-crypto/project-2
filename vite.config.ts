import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// VPL ships at the domain root. Note for anyone comparing this with
// source/physics-sims: that app is deployed under the base "/PhysicsSims/" for
// GitHub Pages, which is why its asset paths and router basename differ here.
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Sandbox/preview hosts reach the dev server through a proxy domain; without
    // this Vite answers 403 for any host it has not been told about.
    allowedHosts: ['.e2b.app', '.localhost'],
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    allowedHosts: ['.e2b.app', '.localhost'],
  },
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.{ts,tsx}'],
  },
});
