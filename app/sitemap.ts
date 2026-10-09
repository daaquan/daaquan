import type { MetadataRoute } from 'next';
import { lastActivity, threadsFor, usedTags } from '@/lib/forum';
import { homePath, notePath, notesPath, origin, publishedLocales, tagPath } from '@/lib/locales';

export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return publishedLocales.flatMap(locale => [
    { url: `${origin}${homePath(locale)}` },
    { url: `${origin}${notesPath(locale)}` },
    ...usedTags(locale).map(tag => ({ url: `${origin}${tagPath(locale, tag.slug)}` })),
    ...threadsFor(locale).map(thread => ({ url: `${origin}${notePath(locale, thread.slug)}`, lastModified: lastActivity(thread).slice(0, 10) })),
  ]);
}
