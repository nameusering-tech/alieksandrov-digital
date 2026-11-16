# TODO – offene Punkte

Stand nach deinen Antworten vom 16.11.2026.

## Entschieden und umgesetzt

- Keine Leistungsangebote: Seite `/leistungen/`, „Projekt anfragen“, „Webseite erstellen lassen“ und das
  ProfessionalService-Schema sind entfernt. Die Startseite zeigt stattdessen drei Arbeitsschwerpunkte ohne Preise.
- Kein Gewerbe: Impressum unverändert wie auf der alten Seite, keine USt-Angaben.
- „6 Monate“ und „9+ Projekte“ bleiben wie auf der alten Seite.
- „CreateBetter.Design“ überall einheitlich.
- Formular ohne Server: öffnet nur das E-Mail-Programm. `extras/contact.php` ist vorbereitet, aber nicht angeschlossen.
- Adresse: Straße steht nur im Impressum und in der Datenschutzerklärung (dort Pflicht bzw. wie bisher). Im JSON-LD
  und im Seitentext steht nur „Hennef (Sieg)“, Geo-Koordinaten sind entfernt.
- Keine Social-Profile, kein neues Porträt.
- Telegram-Screenshot unten abgeschnitten (private Notiz entfernt).

- Zweisprachig: Deutsch unter `/`, Ukrainisch unter `/uk/`, Umschalter DE | UA im Header.

## Ukrainische Version – bitte gegenlesen

- **Dein Name auf Ukrainisch**: „Олександр Алєксандров“ ist aus der lateinischen Schreibweise geraten. Falls falsch:
  in `src/i18n/uk.ts` und `src/layouts/Base.astro` (`alternateName`) ersetzen.
- **Ortsnamen**: „Геннеф (Зіг)“, „район Рейн-Зіг“, „Кельн“, „Бонн“ – so in Ordnung?
- **Fachbegriffe**: „ШІ“ für KI, „воркфлоу“ für Workflow, „імпресум“ für Impressum. Andere Wünsche?
- **Rechtstexte** auf Ukrainisch sind eine Übersetzung mit Hinweis, dass die deutsche Fassung gilt; nicht juristisch geprüft.
- **Schrift**: Barlow Condensed hat keine kyrillischen Zeichen. Ukrainische Überschriften laufen in Oswald, die
  deutsche Seite bleibt bei Barlow Condensed.

## Später klären

1. **Formular-Versand über PHP** (Hetzner): `extras/contact.php` anschließen, Absenderadresse der Domain eintragen: [..]
   Danach den Abschnitt „Kontakt per E-Mail und Kontaktformular“ in der Datenschutzerklärung anpassen.
2. **Datenschutz**: Die Abschnitte „Kontakt per E-Mail und Kontaktformular“ und „Cookies, Tracking und Schriftarten“
   sind neu geschrieben und nicht rechtlich geprüft.
3. **Impressumspflicht**: Ob ein rein privates Portfolio ohne Angebot ein Impressum mit Wohnadresse braucht, ist eine
   Rechtsfrage, die ich nicht verbindlich beantworten kann. Die alte Seite hat eines, deshalb bleibt es drin.
4. **Zahlen**: „6 Monate“ wird mit der Zeit falsch (Praktikum seit Januar 2026). Wert in `src/data/site.ts` → `stats`.
5. **Dritte Kennzahl „24/7“** ersetzt „n8n – Linux & KI – Produktiv im Einsatz“ der alten Seite. Passt das?
6. **Sprachen im JSON-LD** (`knowsLanguage: de, uk`) sind aus dem Lebenslauf geschlossen: [..]
7. **Positionierung**: Der Satz „Ich suche ein Unternehmen mit klaren Rollen …“ steht weiter auf `/ueber-mich/`.
8. **Überschrift Startseite**: „Webdesign & Webentwicklung aus Hennef bei Köln & Bonn“ (ohne Verkaufsversprechen).
9. **Wenn später doch Leistungen angeboten werden**: Leistungsseite, Einzugsgebiet und LocalBusiness-Schema wieder
   ergänzen – dann auch Gewerbe/USt im Impressum klären.

## Technik beim Livegang

10. Die alte Seite steht auf `noindex, nofollow`, die neue ist indexierbar.
11. 301-Weiterleitung: `/erklaerung-zur-barrierefreiheit/` → `/barrierefreiheit/`.
