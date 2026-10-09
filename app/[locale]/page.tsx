import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NoteList } from '@/components/note-list';
import { SiteShell } from '@/components/site-shell';
import { copy } from '@/lib/copy';
import { threadsFor } from '@/lib/forum';
import { homePath, isLocale, notePath, notesPath, pageAlternates, type Locale } from '@/lib/locales';
import { projects } from '@/lib/projects';

function projectHref(locale: Locale, project: (typeof projects)[number]) {
  return project.target.kind === 'note' ? notePath(locale, project.target.slug) : `${homePath(locale)}#now`;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return { alternates: pageAlternates(locale, homePath) };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const text = copy[locale];
  const home = homePath(locale);
  const notes = notesPath(locale);
  return <SiteShell locale={locale} switchPath={homePath}>
    <section className="hero" aria-labelledby="hero-title">
      <p className="eyebrow">PERSONAL WORKSPACE / DAAQUAN</p>
      <h1 id="hero-title">{text.heroLead}<br /><span>{text.heroEmphasis}</span></h1>
      <p className="hero-description">{text.heroBody}<br />{text.heroBody2}</p>
      <div className="hero-actions"><Button asChild size="lg"><Link href={`${home}#work`}>{text.seeWork} <span aria-hidden="true">↗</span></Link></Button><Button asChild size="lg" variant="ghost"><Link href={notes}>{text.openNotes} <span aria-hidden="true">→</span></Link></Button></div>
      <p className="sample-notice">{text.sampleNotice}</p>
    </section>
    <nav className="workspace-grid" aria-label={text.shortcuts}>
      <Link href={`${home}#work`} className="workspace-card"><span className="eyebrow">WORK</span><strong>{String(projects.length).padStart(2, '0')}<span aria-hidden="true">↗</span></strong><span>{text.workCard}</span></Link>
      <Link href={notes} className="workspace-card"><span className="eyebrow">NOTES</span><strong>{String(threadsFor(locale).length).padStart(2, '0')}<span aria-hidden="true">↗</span></strong><span>{text.notesCard}</span></Link>
      <Link href={`${home}#now`} className="workspace-card"><span className="eyebrow">NOW</span><strong>{text.nowShort}<span aria-hidden="true">↗</span></strong><span>{text.nowCard}</span></Link>
      <a href="https://github.com/daaquan" className="workspace-card"><span className="eyebrow">ELSEWHERE</span><strong>GitHub<span aria-hidden="true">↗</span></strong><span>{text.elsewhereCard}</span></a>
    </nav>
    <section id="work" className="content-section" aria-labelledby="work-title">
      <div className="section-heading"><div><p className="eyebrow">WORK</p><h2 id="work-title">{text.work}</h2></div><p>{text.workIntro}</p></div>
      <div className="work-grid">{projects.map(project => {
        const detail = text.projects[project.key];
        const href = projectHref(locale, project);
        return <article className="project" key={project.key}>
          <Link className={`project-cover ${project.variant}`} prefetch={false} href={href} aria-label={`${detail.title}：${detail.linkLabel}`}><span aria-hidden="true" className="project-motif">{project.motif}</span><span className="cover-arrow" aria-hidden="true">↗</span></Link>
          <div className="project-meta"><span>{project.category}</span>{project.sample ? <Badge variant="outline">{text.sampleBadge}</Badge> : null}</div>
          <h3>{detail.title}</h3><p className="project-description">{detail.description}</p><Link className="text-link" prefetch={false} href={href}>{detail.linkLabel} <span aria-hidden="true">↗</span></Link>
        </article>;
      })}</div>
    </section>
    <section id="notes" className="content-section" aria-labelledby="notes-title">
      <div className="section-heading"><div><p className="eyebrow">NOTES</p><h2 id="notes-title">{text.notesTitle}</h2></div><Link className="text-link" href={notes}>{text.seeTopics} <span aria-hidden="true">→</span></Link></div>
      <p className="section-description">{text.notesIntro}</p><NoteList locale={locale} />
    </section>
    <section id="now" className="content-section now-section" aria-labelledby="now-title">
      <div><p className="eyebrow">NOW</p><h2 id="now-title">{text.nowTitle}</h2><p className="section-description">{text.nowBody}<br />{text.nowBody2}</p><Badge variant="outline">{text.nowBadge}</Badge></div>
      <ul className="now-list">{text.nowItems.map(([title, body]) => <li key={title}><h3>{title}</h3><p>{body}</p></li>)}</ul>
    </section>
    <section className="hello-section" aria-labelledby="hello-title"><div><p className="eyebrow">HELLO</p><h2 id="hello-title">{text.helloTitle}</h2><p>{text.helloBody}<br />{text.helloBody2}</p></div><Button asChild variant="outline"><a href="https://github.com/daaquan">{text.seeGithub} <span aria-hidden="true">↗</span></a></Button></section>
  </SiteShell>;
}
