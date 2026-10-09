import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { copy, ogLocale } from '@/lib/copy';
import { isLocale, publishedLocales } from '@/lib/locales';

export const dynamicParams = false;

export function generateStaticParams() {
  return publishedLocales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const text = copy[locale];
  return {
    title: { default: text.defaultTitle, template: '%s | daaquan' },
    description: text.siteDescription,
    openGraph: {
      locale: ogLocale[locale],
      alternateLocale: publishedLocales.filter(item => item !== locale).map(item => ogLocale[item]),
    },
  };
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  if (!isLocale((await params).locale)) notFound();
  return children;
}
