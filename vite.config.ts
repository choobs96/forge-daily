import { defineConfig } from 'vitest/config';
import type { Plugin } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dir = dirname(fileURLToPath(import.meta.url));

/**
 * cards.js lives at the repo root — it is the append-only contract with the
 * external content-refresh job and must NOT move or be bundled. This plugin
 * serves it in dev; scripts/copy-cards.mjs copies it into dist/ after build.
 */
function serveCards(): Plugin {
  return {
    name: 'serve-cards-js',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if ((req.url ?? '').split('?')[0]?.endsWith('/cards.js')) {
          res.setHeader('Content-Type', 'text/javascript');
          res.end(readFileSync(resolve(__dir, 'cards.js')));
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [
    svelte(),
    serveCards(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icon-180.png'],
      manifest: {
        name: 'Forge — Daily DE',
        short_name: 'Forge',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#0a0c1e',
        theme_color: '#0a0c1e',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,webmanifest}'],
        globIgnores: ['legacy/**', 'cards.js'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Content updates flow without a redeploy: network-first, cache fallback.
            urlPattern: /cards\.js$/,
            handler: 'NetworkFirst',
            options: { cacheName: 'forge-cards', networkTimeoutSeconds: 4 },
          },
        ],
      },
    }),
  ],
  build: { target: 'es2022' },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});
