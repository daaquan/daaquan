import type { MetadataRoute } from 'next';
import { lastActivity, threadsFor, usedTags } from '@/lib/forum';
import { defaultLocale, homePath, notePath, notesPath, origin, publishedLocales, tagPath, type Locale } from '@/lib/locales';

export const dynamic = 'force-static';

function languages(pathFor: (locale: Locale) => string) {
  const map: Record<string, string> = { 'x-default': `${origin}${pathFor(defaultLocale)}` };
  for (const locale of publishedLocales) map[locale] = `${origin}${pathFor(locale)}`;
  return map;
}

export default function sitemap(): MetadataRoute.Sitemap {
  return publishedLocales.flatMap(locale => [
    { url: `${origin}${homePath(locale)}`, alternates: { languages: languages(homePath) } },
    { url: `${origin}${notesPath(locale)}`, alternates: { languages: languages(notesPath) } },
    ...usedTags(locale).map(tag => ({ url: `${origin}${tagPath(locale, tag.slug)}`, alternates: { languages: languages(item => tagPath(item, tag.slug)) } })),
    ...threadsFor(locale).map(thread => ({
      url: `${origin}${notePath(locale, thread.slug)}`,
      lastModified: lastActivity(thread).slice(0, 10),
      alternates: { languages: languages(item => notePath(item, thread.slug)) },
    })),
  ]);
}
