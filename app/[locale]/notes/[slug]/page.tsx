import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/site-shell';
import { ThreadView } from '@/components/thread-view';
import { getThread, threadsFor } from '@/lib/forum';
import { isLocale, notePath, pageAlternates, publishedLocales } from '@/lib/locales';

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedLocales.flatMap(locale => threadsFor(locale).map(thread => ({ locale, slug: thread.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const thread = getThread(locale, slug);
  if (!thread) return {};
  return {
    title: thread.title,
    description: thread.excerpt,
    alternates: pageAlternates(notePath(locale, thread.slug)),
    openGraph: { title: thread.title, description: thread.excerpt, type: 'article', publishedTime: thread.created },
  };
}

export default async function NotePage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const thread = getThread(locale, slug);
  if (!thread) notFound();
  return <SiteShell locale={locale} active="notes"><ThreadView thread={thread} /></SiteShell>;
}
