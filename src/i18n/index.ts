import de from './de';
import uk from './uk';

export type Lang = 'de' | 'uk';
export const dicts = { de, uk };
export const t = (lang: Lang) => dicts[lang];

/** Basispfad der Seite (leer auf einer eigenen Domain, „/repo“ auf GitHub Pages). */
export const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

/** Interner Pfad in der gewünschten Sprache: Deutsch ohne Präfix, Ukrainisch unter /uk/. */
export const href = (lang: Lang, path: string) => base + (lang === 'de' ? path : `/uk${path}`);

/** Derselbe Inhalt in der anderen Sprache. */
export const pathIn = (target: Lang, currentPath: string) => {
  const local = currentPath.startsWith(base) ? currentPath.slice(base.length) || '/' : currentPath;
  return href(target, local.replace(/^\/uk(?=\/|$)/, '') || '/');
};
