import type { ReactNode } from 'react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { copy, localeLabel } from '@/lib/copy';
import { threadsFor } from '@/lib/forum';
import { homePath, notesPath, publishedLocales, type Locale } from '@/lib/locales';
import { projects } from '@/lib/projects';

export function SiteShell({ children, active = 'home', locale, switchPath }: { children: ReactNode; active?: 'home' | 'notes'; locale: Locale; switchPath: (locale: Locale) => string }) {
  const text = copy[locale];
  const home = homePath(locale);
  const notes = notesPath(locale);
  return (
    <div className="site-layout">
      <a className="skip-link" href="#main">{text.skip}</a>
      <aside className="sidebar">
        <Link href={home} className="identity" aria-label={text.homeAria}><span className="identity-mark">dq.</span><span className="identity-name">daaquan<span>.</span></span></Link>
        <p className="sidebar-intro">{text.intro}</p>
        <nav aria-label={text.navLabel} className="site-nav">
          <Link href={home} aria-current={active === 'home' ? 'page' : undefined}><span className="nav-index" aria-hidden="true">01</span>{text.home}</Link>
          <Link href={`${home}#work`}><span className="nav-index" aria-hidden="true">02</span>{text.work}<span className="nav-count">{projects.length}</span></Link>
          <Link href={notes} aria-current={active === 'notes' ? 'page' : undefined}><span className="nav-index" aria-hidden="true">03</span>{text.notes}<span className="nav-count">{threadsFor(locale).length}</span></Link>
          <Link href={`${home}#now`}><span className="nav-index" aria-hidden="true">04</span>{text.now}</Link>
        </nav>
        <div className="sidebar-links"><Separator /><a href="https://github.com/daaquan">GitHub <span aria-hidden="true">↗</span></a><a href="/feed.xml">{text.rss} <span aria-hidden="true">↗</span></a></div>
        <div className="sidebar-note"><p className="eyebrow">{text.progressTitle}</p><p>{text.progress}</p></div>
      </aside>
      <div className="page-column">
        <header className="app-toolbar"><div>daaquan / <strong>{active === 'notes' ? text.room : text.home}</strong></div><a href="https://github.com/daaquan" className="toolbar-link">GitHub <span aria-hidden="true">↗</span></a></header>
        <main id="main" tabIndex={-1}>{children}</main>
        <footer className="site-footer">
          <span>© 2026 daaquan</span>
          <span className="footer-spacer">Things in progress.</span>
          <nav className="lang-switch" aria-label={text.languages}>
            {publishedLocales.map(item => <a key={item} href={switchPath(item)} hrefLang={item} lang={item} aria-current={item === locale ? 'page' : undefined}>{localeLabel[item]}</a>)}
          </nav>
          <a href="/feed.xml">{text.rss} ↗</a>
        </footer>
      </div>
    </div>
  );
}
