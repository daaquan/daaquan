import { posts } from '@/lib/posts';

export const dynamic = 'force-static';
const escapeXml = (text: string) => text.replace(/[<>&"']/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[character]!));

export function GET() {
  const origin = 'https://daaquan.com';
  const items = posts.map(post => `<item><title>${escapeXml(`${post.sample ? '【サンプル】' : ''}${post.title}`)}</title><link>${origin}/notes/${post.slug}/</link><guid>${origin}/notes/${post.slug}/</guid><description>${escapeXml(post.description)}</description><pubDate>${new Date(`${post.date}T00:00:00+09:00`).toUTCString()}</pubDate></item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>daaquan / Notes</title><link>${origin}/</link><description>技術と AI の実験ノート。初期掲載分はサンプル記事です。</description><language>ja</language><atom:link href="${origin}/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
