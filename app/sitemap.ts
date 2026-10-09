import type { MetadataRoute } from 'next';
import { posts } from '@/lib/posts';

export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: 'https://daaquan.com/' }, { url: 'https://daaquan.com/notes/' }, ...posts.map(post => ({ url: `https://daaquan.com/notes/${post.slug}/`, lastModified: post.date }))];
}
