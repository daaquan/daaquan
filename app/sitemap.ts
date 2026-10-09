import type { MetadataRoute } from 'next';
import { boardThreads, lastActivity, usedTags } from '@/lib/forum';

export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://daaquan.com/' },
    { url: 'https://daaquan.com/notes/' },
    ...usedTags().map(tag => ({ url: `https://daaquan.com/notes/tag/${tag.slug}/` })),
    ...boardThreads.map(thread => ({ url: `https://daaquan.com/notes/${thread.slug}/`, lastModified: lastActivity(thread).slice(0, 10) })),
  ];
}
