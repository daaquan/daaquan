import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SiteShell } from '@/components/site-shell';
import { ThreadView } from '@/components/thread-view';
import { boardThreads, getThread } from '@/lib/forum';

export const dynamicParams = false;

export function generateStaticParams() {
  return boardThreads.map(thread => ({ slug: thread.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const thread = getThread((await params).slug);
  if (!thread) return {};
  return {
    title: thread.title,
    description: thread.excerpt,
    alternates: { canonical: `/notes/${thread.slug}/` },
    openGraph: { title: thread.title, description: thread.excerpt, type: 'article', publishedTime: thread.created },
  };
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const thread = getThread((await params).slug);
  if (!thread) notFound();
  return <SiteShell active="notes"><ThreadView thread={thread} /></SiteShell>;
}
