# alieksandrov-portfolio

Portfolio von Oleksandr Alieksandrov als statische Astro-Website, zweisprachig: Deutsch (`/`) und Ukrainisch (`/uk/`). Neuaufbau von https://alieksandrov-digital.de/.
Testkopie (noindex): https://nameusering-tech.github.io/alieksandrov-digital/ – jeder Push auf `main` baut und veröffentlicht neu (`.github/workflows/pages.yml`).

## Starten

Voraussetzung: Node.js 22 oder neuer (installiert ist 24 LTS unter `~/.local/opt/node`).

```bash
npm install
npm run dev        # Entwicklungsserver: http://localhost:4321
npm run build      # Production-Build nach dist/
npm run preview    # Build lokal ansehen
npm run check:links  # interne Links und Assets im Build prüfen
npm run icons      # Favicon-Set aus scripts/favicon-source.png (Logo der alten Seite) neu erzeugen
npm run fonts      # Schriften neu zuschneiden (braucht: pip install fonttools brotli)
```

## Stack

- Astro 7, rein statischer Output, kein Client-Framework
- JavaScript gesamt ca. 10 KB: `src/scripts/app.ts` (Header, Reveals, Zähler, Magnet-Buttons, Tilt, Cursor, Formular)
  und der WebGL-Shader für den Hero (`src/scripts/hero-shader.ts`), der nur auf der Startseite im Leerlauf nachlädt
- Keine Animationsbibliothek, kein Smooth-Scroll-Skript: IntersectionObserver, CSS-Transitions, requestAnimationFrame
- Seitenübergänge ohne JS über `@view-transition { navigation: auto }` (Chrome, Safari; Firefox navigiert normal)
- Speculation Rules: Seiten werden beim Überfahren eines Links vorgerendert (Chrome)
- Schriften lokal und auf die benötigten Zeichen zugeschnitten (`src/assets/fonts/`, erzeugt von `scripts/subset-fonts.sh`
  aus den Fontsource-Paketen, ohne Hinting): zusammen ca. 63 KB statt 250 KB. `unicode-range` in `src/styles/fonts.css`
  sorgt dafür, dass Deutsch nur lateinische und Ukrainisch vor allem kyrillische Dateien lädt.
  Barlow Condensed + PT Sans (Deutsch), Oswald + PT Sans (Ukrainisch), VT323 für Zahlen
- Hero-Hintergrund: eigener WebGL-Shader (GLSL), orange-brauner Rauch wie das Hintergrundbild der alten Seite, aber animiert
- Bilder über `astro:assets`/sharp als AVIF mit WebP-Fallback, `width`/`height`, Lazy Loading
- OG-Bilder je Sprache beim Build mit satori + sharp (`src/pages/og/[slug].png.ts`)

## Struktur

```
.github/workflows/pages.yml  Build + Veröffentlichung auf GitHub Pages
astro.config.mjs             Domain, Basis-Pfad, Sitemap, Build-Optionen
extras/contact.php           Vorbereiteter PHP-Versand fürs Formular, noch NICHT angeschlossen
public/                      Dateien 1:1 ins Root: Favicons, Manifest
scripts/                     Hilfsskripte: Linkprüfung, Favicons, Schriften zuschneiden
src/
  assets/                    Bilder (werden beim Build zu AVIF/WebP) und fonts/ (zugeschnittene WOFF2)
  components/                Wiederverwendbare Bausteine (Kontakt, Formular, Projektkarte, Icons …)
  data/site.ts               Sprachunabhängiges: Kontakt, Kennzahlen, Tech-Stack, Projekte
  data/images.ts             Zuordnung Projekt → Bilder
  i18n/de.ts, uk.ts          Alle Texte je Sprache (uk.ts muss dieselbe Struktur haben, TypeScript prüft das)
  i18n/index.ts              t(lang), href(lang, pfad), pathIn(zielsprache, aktuellerPfad)
  layouts/Base.astro         <head>, SEO-Meta, hreflang, JSON-LD, Header mit Sprachumschalter, Footer
  pages/                     Dünne Routen: deutsche Seiten direkt, ukrainische unter pages/uk/, OG-Bilder, robots.txt
  views/                     Seiteninhalte mit lang-Prop (Home, Projects, ProjectDetail, About, ContactPage, Impressum …)
  scripts/app.ts             Gesamtes Seiten-JavaScript (Header, Einblenden, Zähler, Cursor, Formular)
  scripts/hero-shader.ts     WebGL-Rauch im Hero, wird nur auf der Startseite nachgeladen
  styles/index.css           Einstieg, importiert in fester Reihenfolge:
    fonts.css  base.css  components.css  header.css  hero.css  sections.css  pages.css  footer.css  motion.css
    lang-uk.css              Mehr Zeilenabstand und Oswald für Kyrillisch
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
