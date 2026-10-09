import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://daaquan.com'),
  title: { default: 'daaquan | つくる、試す、書き残す。', template: '%s | daaquan' },
  description: '作品と、日々の活動と、技術・AI の実験ノート。daaquan の個人サイト。',
  alternates: { types: { 'application/rss+xml': '/feed.xml' } },
  openGraph: { siteName: 'daaquan', locale: 'ja_JP', type: 'website' },
};
export const viewport: Viewport = { themeColor: '#fff4cc' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="ja"><body><a className="skip-link" href="#main">本文へ移動</a>{children}</body></html>;
}
