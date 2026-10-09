import type { ReactNode } from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';

export function SiteShell({ children, active = 'home' }: { children: ReactNode; active?: 'home' | 'notes' }) {
  return (
    <div className="site-layout">
      <aside className="sidebar">
        <Link href="/" className="identity" aria-label="daaquan ホーム"><span className="identity-mark">dq.</span><span className="identity-name">daaquan<span>.</span></span></Link>
        <p className="sidebar-intro">つくる、試す、書き残す。</p>
        <nav aria-label="メインナビゲーション" className="site-nav">
          <Link href="/" aria-current={active === 'home' ? 'page' : undefined}>ホーム</Link>
          <Link href="/#work">つくったもの</Link>
          <Link href="/notes/" aria-current={active === 'notes' ? 'page' : undefined}>ノート</Link>
          <Link href="/#now">いま</Link>
        </nav>
        <div className="sidebar-links"><Separator /><a href="https://github.com/daaquan">GitHub <span aria-hidden="true">↗</span></a><a href="/feed.xml">RSS <span aria-hidden="true">↗</span></a></div>
        <p className="sidebar-note">小さくつくって、<br />少しずつ育てる。</p>
      </aside>
      <div className="page-column">
        <main id="main" tabIndex={-1}>{children}</main>
        <footer className="site-footer"><span>© 2026 daaquan</span><span>Things in progress.</span><a href="/feed.xml">RSS ↗</a></footer>
      </div>
    </div>
  );
}
