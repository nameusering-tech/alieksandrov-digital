// Sprachunabhängige Daten. Texte stehen in src/i18n/de.ts und src/i18n/uk.ts.
export const site = {
  url: 'https://alieksandrov-digital.de',
  brand: 'alieksandrov-digital',
  email: 'alieksandrov.arbeit@gmail.com',
  phoneDisplay: '+49 15560 536649',
  phoneHref: '+4915560536649',
  whatsapp: 'https://wa.me/4915560536649',
  address: { street: 'Am Scheidssiefen 8', zip: '53773', city: 'Hennef (Sieg)' },
};

export const stats = [
  { value: 6, suffix: '' },
  { value: 9, suffix: '+' },
  { value: 24, suffix: '/7' },
];

export const stack = ['WordPress', 'Figma', 'n8n', 'Make.com', 'Claude API', 'Linux', 'JavaScript', 'HTML/CSS'];

export const projects = [
  { slug: 'bsh-hupperich', tags: ['WordPress', 'Claude', 'CSS/JS', 'Figma'], url: 'https://bsh-hupperich.de/', images: ['bsh'] },
  {
    slug: 'telegram-ki-assistent',
    tags: ['n8n', 'Claude API', 'Telegram Bot API', 'Linux Server', 'JavaScript', 'SerpAPI', 'Notion API'],
    url: '',
    images: ['telegram2', 'telegram1'],
  },
  {
    slug: 'social-media-automatisierung',
    tags: ['Make.com', 'OpenAI', 'JSON', 'HTTP', 'HTML/CSS', 'Instagram', 'Facebook', 'LinkedIn'],
    url: '',
    images: ['social2', 'social1'],
  },
];
export type ProjectBase = (typeof projects)[number];
