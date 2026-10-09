import Link from 'next/link';
import { SiteShell } from '@/components/site-shell';
import { Button } from '@/components/ui/button';
import { copy } from '@/lib/copy';
import { defaultLocale, homePath } from '@/lib/locales';

export default function NotFound() {
  const text = copy[defaultLocale];
  return <SiteShell locale={defaultLocale} switchPath={homePath}><div className="page-header"><p className="eyebrow">404</p><h1>{text.missingTitle}</h1><p>{text.missingBody}</p><Button asChild><Link href={homePath(defaultLocale)}>{text.missingHome}</Link></Button></div></SiteShell>;
}
