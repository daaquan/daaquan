import type { Metadata } from 'next';

// Published locales are an explicit gate. A future translator in /opt/social
// may propose copy, but adding a code here is what creates public URLs.
// Do not let a self-improvement loop edit this list from a prompt.
export const publishedLocales = ['ja', 'en', 'zh'] as const;
export type Locale = (typeof publishedLocales)[number];
export const defaultLocale: Locale = 'ja';
export const origin = 'https://daaquan.com';

export function isLocale(value: string): value is Locale {
  return (publishedLocales as readonly string[]).includes(value);
}

export function homePath(locale: Locale) {
  return `/${locale}/`;
}

export function notesPath(locale: Locale) {
  return `/${locale}/notes/`;
}

export function notePath(locale: Locale, slug: string) {
  return `/${locale}/notes/${slug}/`;
}

export function tagPath(locale: Locale, tag: string) {
  return `/${locale}/notes/tag/${tag}/`;
}

// hreflang is reciprocal across every published locale. x-default stays on
// Japanese. Paths are absolute to the site origin via metadataBase.
export function pageAlternates(locale: Locale, pathFor: (locale: Locale) => string): Metadata['alternates'] {
  const languages: Record<string, string> = {};
  for (const item of publishedLocales) languages[item] = pathFor(item);
  languages['x-default'] = pathFor(defaultLocale);
  return { canonical: pathFor(locale), languages };
}
