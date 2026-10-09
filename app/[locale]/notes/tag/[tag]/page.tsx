import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ForumBoard } from '@/components/forum-board';
import { SiteShell } from '@/components/site-shell';
import { tagMeta, threadsByTag, usedTags } from '@/lib/forum';
import { isLocale, pageAlternates, publishedLocales, tagPath } from '@/lib/locales';

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedLocales.flatMap(locale => usedTags(locale).map(tag => ({ locale, tag: tag.slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; tag: string }> }): Promise<Metadata> {
  const { locale, tag } = await params;
  if (!isLocale(locale)) return {};
  if (threadsByTag(locale, tag).length === 0) return {};
  const meta = tagMeta(tag);
  return {
    title: `${meta.label} の話題`,
    description: meta.blurb,
    alternates: pageAlternates(tagPath(locale, tag)),
  };
}

export default async function TagPage({ params }: { params: Promise<{ locale: string; tag: string }> }) {
  const { locale, tag } = await params;
  if (!isLocale(locale) || threadsByTag(locale, tag).length === 0) notFound();
  return <SiteShell locale={locale} active="notes"><ForumBoard locale={locale} tag={tag} /></SiteShell>;
}
