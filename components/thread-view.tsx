import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Blocks } from '@/components/blocks';
import { copy } from '@/lib/copy';
import { formatDay, moveMeta, tagMeta, voiceById, type Thread } from '@/lib/forum';
import { notesPath, tagPath } from '@/lib/locales';

export function ThreadView({ thread }: { thread: Thread }) {
  const text = copy[thread.locale];
  const notes = notesPath(thread.locale);
  const opener = voiceById(thread.locale, thread.voice);
  return (
    <article className="article-page">
      <Link className="text-link back-link" href={notes}>{text.backToNotes}</Link>
      <header className="article-header">
        <div className="article-meta">
          <span className={`voice-mark hue-${opener.hue}`} aria-hidden="true">{opener.mark}</span>
          <span>{opener.name} · {opener.field}</span>
          <time dateTime={thread.created}>{formatDay(thread.created, thread.locale)}</time>
          {thread.pinned ? <Badge>{text.pinned}</Badge> : null}
          {thread.sample ? <Badge variant="outline">{text.sample}</Badge> : null}
        </div>
        <h1>{thread.title}</h1>
        <p className="article-lead">{thread.excerpt}</p>
        <p className="topic-meta">{thread.tags.map(tag => <Link key={tag} href={tagPath(thread.locale, tag)}>{tagMeta(thread.locale, tag).label}</Link>)}</p>
      </header>
      <div className="prose"><Blocks blocks={thread.blocks} locale={thread.locale} /></div>
      <section aria-labelledby="replies-title" className="reply-section">
        <h2 id="replies-title">{text.angles} <span>{thread.replies.length}</span></h2>
        <ol className="reply-list">
          {thread.replies.map(reply => {
            const voice = voiceById(thread.locale, reply.voice);
            const move = moveMeta(thread.locale, reply.move);
            return (
              <li key={reply.id}>
                <article className="reply-card" id={reply.id}>
                  <div className="reply-head">
                    <span className={`move-stamp move-${reply.move}`}>{move.label}</span>
                    <span aria-hidden="true" className={`voice-mark hue-${voice.hue}`}>{voice.mark}</span>
                    <span className="reply-who"><strong>{voice.name}</strong><span>{move.detail}</span></span>
                    <time dateTime={reply.at}>{formatDay(reply.at, thread.locale)}</time>
                  </div>
                  <div className="reply-body"><Blocks blocks={reply.blocks} locale={thread.locale} /></div>
                </article>
              </li>
            );
          })}
        </ol>
      </section>
      <div className="article-end">
        <Link className="text-link" href={notes}>{text.otherNotes}</Link>
        <a className="text-link" href="/feed.xml">{text.feedLink} ↗</a>
      </div>
    </article>
  );
}
