import { notFound } from 'next/navigation';
import { isLocale, publishedLocales } from '@/lib/locales';

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedLocales.map(locale => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  if (!isLocale((await params).locale)) notFound();
  return children;
}
