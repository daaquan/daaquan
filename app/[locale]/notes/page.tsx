import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ForumBoard } from '@/components/forum-board';
import { SiteShell } from '@/components/site-shell';
import { isLocale, notesPath, pageAlternates } from '@/lib/locales';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: '会議室',
    description: '専門の住人が、読んだものに角度をつけて話すノート。要約、転用、自前、横から。',
    alternates: pageAlternates(notesPath(locale)),
  };
}

export default async function NotesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <SiteShell locale={locale} active="notes"><ForumBoard locale={locale} /></SiteShell>;
}
