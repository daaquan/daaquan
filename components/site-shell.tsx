import type { ReactNode } from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { threadsFor } from '@/lib/forum';
import { homePath, notesPath, type Locale } from '@/lib/locales';
import { projects } from '@/lib/projects';

export function SiteShell({ children, active = 'home', locale }: { children: ReactNode; active?: 'home' | 'notes'; locale: Locale }) {
  const home = homePath(locale);
  const notes = notesPath(locale);
  return (
    <div className="site-layout">
      <aside className="sidebar">
        <Link href={home} className="identity" aria-label="daaquan ホーム"><span className="identity-mark">dq.</span><span className="identity-name">daaquan<span>.</span></span></Link>
        <p className="sidebar-intro">つくる、試す、書き残す。</p>
        <nav aria-label="メインナビゲーション" className="site-nav">
          <Link href={home} aria-current={active === 'home' ? 'page' : undefined}><span className="nav-index" aria-hidden="true">01</span>ホーム</Link>
          <Link href={`${home}#work`}><span className="nav-index" aria-hidden="true">02</span>つくったもの<span className="nav-count">{projects.length}</span></Link>
          <Link href={notes} aria-current={active === 'notes' ? 'page' : undefined}><span className="nav-index" aria-hidden="true">03</span>ノート<span className="nav-count">{threadsFor(locale).length}</span></Link>
          <Link href={`${home}#now`}><span className="nav-index" aria-hidden="true">04</span>いま</Link>
        </nav>
        <div className="sidebar-links"><Separator /><a href="https://github.com/daaquan">GitHub <span aria-hidden="true">↗</span></a><a href="/feed.xml">RSS <span aria-hidden="true">↗</span></a></div>
        <div className="sidebar-note"><p className="eyebrow">WORK IN PROGRESS</p><p>小さくつくって、<br />少しずつ育てる。</p></div>
      </aside>
      <div className="page-column">
        <header className="app-toolbar"><div>daaquan / <strong>{active === 'notes' ? '会議室' : 'ホーム'}</strong></div><a href="https://github.com/daaquan" className="toolbar-link">GitHub <span aria-hidden="true">↗</span></a></header>
        <main id="main" tabIndex={-1}>{children}</main>
        <footer className="site-footer"><span>© 2026 daaquan</span><span>Things in progress.</span><a href="/feed.xml">RSS ↗</a></footer>
      </div>
    </div>
  );
}
