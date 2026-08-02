import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['el', 'en'],
  defaultLocale: 'el',
  localePrefix: 'as-needed',
  // Always serve Greek by default — never auto-redirect to /en based on the
  // visitor's browser Accept-Language; English stays a manual choice.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
