# alieksandrov-portfolio

Portfolio von Oleksandr Alieksandrov als statische Astro-Website, zweisprachig: Deutsch (`/`) und Ukrainisch (`/uk/`). Neuaufbau von https://alieksandrov-digital.de/ – nur lokal, nicht veröffentlicht.

## Starten

Voraussetzung: Node.js 22 oder neuer (installiert ist 24 LTS unter `~/.local/opt/node`).

```bash
npm install
npm run dev        # Entwicklungsserver: http://localhost:4321
npm run build      # Production-Build nach dist/
npm run preview    # Build lokal ansehen
npm run check:links  # interne Links und Assets im Build prüfen
node scripts/icons.mjs  # Favicon-Set aus public/favicon.svg neu erzeugen
```

## Stack

- Astro 7, rein statischer Output, kein Client-Framework
- JavaScript gesamt ca. 10 KB: `src/scripts/app.ts` (Header, Reveals, Zähler, Magnet-Buttons, Tilt, Cursor, Formular)
  und der WebGL-Shader für den Hero (`src/scripts/hero-shader.ts`), der nur auf der Startseite im Leerlauf nachlädt
- Keine Animationsbibliothek, kein Smooth-Scroll-Skript: IntersectionObserver, CSS-Transitions, requestAnimationFrame
- Seitenübergänge ohne JS über `@view-transition { navigation: auto }` (Chrome, Safari; Firefox navigiert normal)
- Speculation Rules: Seiten werden beim Überfahren eines Links vorgerendert (Chrome)
- Schriften lokal aus Fontsource-Paketen, eigene `@font-face`-Regeln mit `unicode-range` in `src/styles/fonts.css`:
  Barlow Condensed + PT Sans (Deutsch), Oswald + PT Sans kyrillisch (Ukrainisch), VT323 für Zahlen
- Bilder über `astro:assets`/sharp als AVIF mit WebP-Fallback, `width`/`height`, Lazy Loading
- OG-Bilder je Sprache beim Build mit satori + sharp (`src/pages/og/[slug].png.ts`)

## Struktur

```
src/i18n/de.ts, uk.ts   Alle Texte je Sprache (uk.ts muss dieselbe Struktur wie de.ts haben, TypeScript prüft das)
src/i18n/index.ts       t(lang), href(lang, pfad), pathIn(zielsprache, aktuellerPfad)
src/data/site.ts        Sprachunabhängiges: Kontakt, Kennzahlen, Tech-Stack, Projekt-Slugs/Tags/Bilder
src/views/              Seiteninhalte mit lang-Prop (Home, Projects, ProjectDetail, About, ContactPage, Impressum, Privacy, A11y)
src/pages/              Dünne Routen: deutsche Seiten direkt, ukrainische unter src/pages/uk/
src/layouts/Base.astro  <head>, SEO-Meta, hreflang, JSON-LD, Header mit Sprachumschalter, Footer
src/styles/             fonts.css (Schriften), global.css (Design-Tokens und alle Styles)
extras/contact.php      Vorbereiteter PHP-Versand fürs Formular, noch NICHT angeschlossen
```

Neuen Text ändern: in `src/i18n/de.ts` und `src/i18n/uk.ts` an derselben Stelle.

## Kontaktformular

Das Formular sendet nichts an einen Server. Es öffnet das E-Mail-Programm des Besuchers mit der fertigen Nachricht
(`mailto:`). Für späteren Server-Versand liegt `extras/contact.php` bereit (ungetestet); dafür müsste die Datei nach
`public/api/` und `setupForm()` in `src/scripts/app.ts` wieder per `fetch` senden.

## SEO

- Pro Seite und Sprache eigener Title, Description, Canonical, Open Graph, Twitter Card
- hreflang `de`, `uk` und `x-default` (zeigt auf Deutsch), auch in der Sitemap
- JSON-LD: WebSite, Person (nur Ort, keine Straße), WebPage, BreadcrumbList, CreativeWork (Projekte), FAQPage,
  ItemList, ProfilePage, ContactPage. Kein LocalBusiness/ProfessionalService, solange keine Leistungen angeboten werden.
- `sitemap-index.xml`, `robots.txt`, `site.webmanifest`, Favicon-Set
- Die Domain steht in `astro.config.mjs` (`site`) und `src/data/site.ts` (`url`)

## Barrierefreiheit und Bewegung

Bei `prefers-reduced-motion: reduce` gibt es keine Reveals, keinen Cursor-Kreis und der Hero zeigt ein Standbild. Der Shader startet erst nach dem Laden, pausiert außerhalb des Viewports und reduziert auf schwachen
Geräten selbst Auflösung bzw. friert ein.

Offene Punkte stehen in `TODO.md`.
