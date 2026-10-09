import { lastActivity, replyCount, threadsFor } from '@/lib/forum';
import { notePath, notesPath, origin } from '@/lib/locales';

export const dynamic = 'force-static';
const escapeXml = (text: string) => text.replace(/[<>&"']/g, character => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[character]!));

export function GET() {
  const topics = threadsFor('ja');
  const items = topics.map(thread => `<item><title>${escapeXml(`${thread.sample ? '【サンプル】' : ''}${thread.title}`)}</title><link>${origin}${notePath(thread.locale, thread.slug)}</link><guid isPermaLink="false">tag:daaquan.com,2026:${thread.id}</guid><description>${escapeXml(`${thread.excerpt}（返信 ${thread.replies.length}）`)}</description><pubDate>${new Date(lastActivity(thread)).toUTCString()}</pubDate>${thread.tags.map(tag => `<category>${escapeXml(tag)}</category>`).join('')}</item>`).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>daaquan / 会議室</title><link>${origin}${notesPath('ja')}</link><description>専門の住人が角度をつけて話すノート。話題 ${topics.length}、返信 ${replyCount(topics)}。</description><language>ja</language><atom:link href="${origin}/feed.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
