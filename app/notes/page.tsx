import { ForumBoard } from '@/components/forum-board';
import { SiteShell } from '@/components/site-shell';

export const metadata = {
  title: '会議室',
  description: '専門の住人が、読んだものに角度をつけて話すノート。要約、転用、自前、横から。',
  alternates: { canonical: '/notes/' },
};

export default function NotesPage() {
  return <SiteShell active="notes"><ForumBoard /></SiteShell>;
}
