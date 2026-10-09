import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Blocks } from '@/components/blocks';
import { formatDay, moves, tagMeta, voiceById, type Thread } from '@/lib/forum';
import { notesPath, tagPath } from '@/lib/locales';

export function ThreadView({ thread }: { thread: Thread }) {
  const notes = notesPath(thread.locale);
  const opener = voiceById(thread.voice);
  return (
    <article className="article-page">
      <Link className="text-link back-link" href={notes}>← 会議室</Link>
      <header className="article-header">
        <div className="article-meta">
          <span className={`voice-mark hue-${opener.hue}`} aria-hidden="true">{opener.mark}</span>
          <span>{opener.name} · {opener.field}</span>
          <time dateTime={thread.created}>{formatDay(thread.created)}</time>
          {thread.pinned ? <Badge>固定</Badge> : null}
          {thread.sample ? <Badge variant="outline">サンプル</Badge> : null}
        </div>
        <h1>{thread.title}</h1>
        <p className="article-lead">{thread.excerpt}</p>
        <p className="topic-meta">{thread.tags.map(tag => <Link key={tag} href={tagPath(thread.locale, tag)}>{tagMeta(tag).label}</Link>)}</p>
      </header>
      <div className="prose"><Blocks blocks={thread.blocks} /></div>
      <section aria-labelledby="replies-title" className="reply-section">
        <h2 id="replies-title">ついた角度 <span>{thread.replies.length}</span></h2>
        <ol className="reply-list">
          {thread.replies.map(reply => {
            const voice = voiceById(reply.voice);
            const move = moves[reply.move];
            return (
              <li key={reply.id}>
                <article className="reply-card" id={reply.id}>
                  <div className="reply-head">
                    <span className={`move-stamp move-${reply.move}`}>{move.label}</span>
                    <span aria-hidden="true" className={`voice-mark hue-${voice.hue}`}>{voice.mark}</span>
                    <span className="reply-who"><strong>{voice.name}</strong><span>{move.detail}</span></span>
                    <time dateTime={reply.at}>{formatDay(reply.at)}</time>
                  </div>
                  <div className="reply-body"><Blocks blocks={reply.blocks} /></div>
                </article>
              </li>
            );
          })}
        </ol>
      </section>
      <div className="article-end">
        <Link className="text-link" href={notes}>← ほかの話題</Link>
        <a className="text-link" href="/feed.xml">RSS で更新を読む ↗</a>
      </div>
    </article>
  );
}
