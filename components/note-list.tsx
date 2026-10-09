import Link from 'next/link';
import { tagMeta, threadsFor } from '@/lib/forum';
import { notePath, type Locale } from '@/lib/locales';

export function NoteList({ locale }: { locale: Locale }) {
  return <div className="note-list">{threadsFor(locale).map(thread => (
    <Link className="note-row" href={notePath(locale, thread.slug)} id={thread.legacyId} key={thread.slug} prefetch={false}>
      <div className="note-row-meta"><span>{tagMeta(thread.tags[0]).label}</span><span>返信 {thread.replies.length}</span></div>
      <div className="note-row-copy"><h3>{thread.title}</h3></div>
      <span aria-hidden="true" className="note-arrow">↗</span>
    </Link>
  ))}</div>;
}
