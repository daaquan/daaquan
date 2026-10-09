import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return <SiteShell><div className="page-header"><p className="eyebrow">404</p><h1>ページが見つかりません。</h1><p>URL を確認するか、ホームから作品やノートを探してみてください。</p><Button asChild><Link href="/">ホームへ戻る</Link></Button></div></SiteShell>;
}
