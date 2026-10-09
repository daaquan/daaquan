import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { Button } from '@/components/ui/button';
import { defaultLocale, homePath } from '@/lib/locales';

export default function NotFound() {
  return <SiteShell locale={defaultLocale}><div className="page-header"><p className="eyebrow">404</p><h1>ページが見つかりません。</h1><p>URL を確認するか、ホームから作品やノートを探してみてください。</p><Button asChild><Link href={homePath(defaultLocale)}>ホームへ戻る</Link></Button></div></SiteShell>;
}
