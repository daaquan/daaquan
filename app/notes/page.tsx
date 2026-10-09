import { SiteShell } from '@/components/site-shell';
import { NoteList } from '@/components/note-list';

export const metadata = { title: 'ノート', description: '技術と AI、個人開発、日々の発見を記録するノート。', alternates: { canonical: '/notes/' } };

export default function NotesPage() {
  return <SiteShell active="notes"><header className="page-header"><p className="eyebrow">NOTES</p><h1>考えたこと、<br />試したこと。</h1><p>技術のニュースを、自分で触った手触りと一緒に。<br />最初の掲載分は、記事形式を確認するためのサンプルです。</p><a className="text-link" href="/feed.xml">RSS で読む ↗</a></header><NoteList descriptions /></SiteShell>;
}
