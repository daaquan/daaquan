import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SiteShell } from '@/components/site-shell';
import { NoteList } from '@/components/note-list';
import { projects } from '@/lib/projects';

export const metadata = { alternates: { canonical: '/' } };

export default function HomePage() {
  return <SiteShell>
    <section className="hero" aria-labelledby="hero-title">
      <p className="eyebrow">A PERSONAL WEBSITE</p>
      <h1 id="hero-title">アイデアを、<br /><span>小さく動くものに。</span></h1>
      <p className="hero-description">つくったもの、いま取り組んでいること。<br />技術と AI を触りながら、日々の発見をここに集めます。</p>
      <div className="hero-actions"><Button asChild size="lg"><Link href="#work">つくったものを見る <span aria-hidden="true">↗</span></Link></Button><Button asChild size="lg" variant="ghost"><Link href="/notes/">ノートを読む <span aria-hidden="true">→</span></Link></Button></div>
      <p className="sample-notice">はじめの一歩。作品・記事・活動の掲載内容はサンプルです。</p>
    </section>
    <section id="work" className="content-section" aria-labelledby="work-title">
      <div className="section-heading"><div><p className="eyebrow">WORK</p><h2 id="work-title">つくったもの</h2></div><p>便利なもの。気になるもの。まずは、つくってみる。</p></div>
      <div className="work-grid">{projects.map(project => <article className="project" key={project.title}>
        <Link className={`project-cover ${project.variant}`} prefetch={false} href={project.href} aria-label={`${project.title}：${project.linkLabel}`}><span aria-hidden="true" className="project-motif">{project.motif}</span><span className="cover-arrow" aria-hidden="true">↗</span></Link>
        <div className="project-meta"><span>{project.category}</span>{project.sample ? <Badge variant="outline">展示サンプル</Badge> : null}</div>
        <h3>{project.title}</h3><p className="project-description">{project.description}</p><Link className="text-link" prefetch={false} href={project.href}>{project.linkLabel} <span aria-hidden="true">↗</span></Link>
      </article>)}</div>
    </section>
    <section id="notes" className="content-section" aria-labelledby="notes-title">
      <div className="section-heading"><div><p className="eyebrow">NOTES</p><h2 id="notes-title">考えたこと、試したこと</h2></div><Link className="text-link" href="/notes/">ノート一覧 <span aria-hidden="true">→</span></Link></div>
      <p className="section-description">技術のニュースを、自分で触った手触りと一緒に。</p><NoteList />
    </section>
    <section id="now" className="content-section now-section" aria-labelledby="now-title">
      <div><p className="eyebrow">NOW</p><h2 id="now-title">いま、気になっていること。</h2><p className="section-description">完成する前の、考えごとも置いておく。<br />そのときの活動や関心を、ここに残していきます。</p><Badge variant="outline">掲載テーマのサンプル</Badge></div>
      <ul className="now-list"><li><h3>AI を日常の道具にする</h3><p>技術の変化を、実際の使い道につなげる。</p></li><li><h3>小さなプロダクトを育てる</h3><p>自分が使いたいものを、動くかたちに。</p></li><li><h3>学びを、外にひらく</h3><p>発見も失敗も、次の誰かのヒントに。</p></li></ul>
    </section>
    <section className="hello-section" aria-labelledby="hello-title"><div><p className="eyebrow">HELLO</p><h2 id="hello-title">ここから、つながる。</h2><p>作品のコードや、これからの試行錯誤は GitHub に。<br />この場所も、つくりながら育てていきます。</p></div><Button asChild variant="outline"><a href="https://github.com/daaquan">GitHub を見る <span aria-hidden="true">↗</span></a></Button></section>
  </SiteShell>;
}
