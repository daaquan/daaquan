import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ForumBoard } from '@/components/forum-board';
import { SiteShell } from '@/components/site-shell';
import { copy } from '@/lib/copy';
import { isLocale, notesPath, pageAlternates } from '@/lib/locales';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const text = copy[locale];
  return {
    title: text.notesTitle,
    description: text.notesDescription,
    alternates: pageAlternates(locale, notesPath),
  };
}

export default async function NotesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <SiteShell locale={locale} active="notes" switchPath={notesPath}><ForumBoard locale={locale} /></SiteShell>;
}
