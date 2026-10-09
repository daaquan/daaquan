import type { Metadata } from 'next';

// Published locales are an explicit gate. A future translator in /opt/social
// may propose copy, but adding a code here is what creates public URLs.
// Do not let a self-improvement loop edit this list from a prompt.
export const publishedLocales = ['ja'] as const;
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

// One published locale does not get a hreflang cluster. Google drops a
// cluster that does not have a real, reciprocal alternate. Add the languages
// map in the same change that appends a second published locale.
export function pageAlternates(path: string): Metadata['alternates'] {
  return { canonical: path };
}
