import type { Metadata } from 'next';
import { homePath } from '@/lib/locales';

const home = homePath('ja');

export const metadata: Metadata = {
  alternates: { canonical: home },
  robots: { index: false, follow: true },
};

export default function RootRedirect() {
  return (
    <main id="main">
      <meta httpEquiv="refresh" content={`0; url=${home}`} />
      <p><a href={home}>daaquan へ移動します。</a></p>
    </main>
  );
}
