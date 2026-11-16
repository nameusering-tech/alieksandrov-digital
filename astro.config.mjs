import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  // Für den Test auf GitHub Pages setzt der Workflow SITE_URL und SITE_BASE.
  site: process.env.SITE_URL || 'https://alieksandrov-digital.de',
  base: process.env.SITE_BASE || '/',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/404'),
      i18n: { defaultLocale: 'de', locales: { de: 'de-DE', uk: 'uk-UA' } },
    }),
  ],
  // CSS steckt inline in jeder Seite (kein Render-Blocking-Request).
  build: { inlineStylesheets: 'always' },
  // Schriften nie als Base64 in das CSS einbetten: als Datei werden sie einmal geladen und gecacht.
  vite: { build: { assetsInlineLimit: 0 } },
  // HTML ohne überflüssige Leerzeichen ausliefern
  compressHTML: true,
  server: { port: 4321 },
  devToolbar: { enabled: false },
});
