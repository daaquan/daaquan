import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ForumBoard } from '@/components/forum-board';
import { SiteShell } from '@/components/site-shell';
import { tagMeta, threadsByTag, usedTags } from '@/lib/forum';

export const dynamicParams = false;

export function generateStaticParams() {
  return usedTags().map(tag => ({ tag: tag.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }): Promise<Metadata> {
  const { tag } = await params;
  const topics = threadsByTag(tag);
  if (topics.length === 0) return {};
  const meta = tagMeta(tag);
  return {
    title: `${meta.label} の話題`,
    description: meta.blurb,
    alternates: { canonical: `/notes/tag/${tag}/` },
  };
}

export default async function TagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  if (threadsByTag(tag).length === 0) notFound();
  return <SiteShell active="notes"><ForumBoard tag={tag} /></SiteShell>;
}
