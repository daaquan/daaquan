import Link from 'next/link';
import { boardThreads, tagMeta } from '@/lib/forum';

export function NoteList() {
  return <div className="note-list">{boardThreads.map(thread => (
    <Link className="note-row" href={`/notes/${thread.slug}/`} id={thread.legacyId} key={thread.slug} prefetch={false}>
      <div className="note-row-meta"><span>{tagMeta(thread.tags[0]).label}</span><span>返信 {thread.replies.length}</span></div>
      <div className="note-row-copy"><h3>{thread.title}</h3></div>
      <span aria-hidden="true" className="note-arrow">↗</span>
    </Link>
  ))}</div>;
}
