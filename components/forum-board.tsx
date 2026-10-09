import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { boardThreads, formatDay, lastActivity, latestReply, moves, replyCount, tagMeta, threadsByTag, usedTags, voiceById, voiceList, type Thread } from '@/lib/forum';

function TopicRow({ thread }: { thread: Thread }) {
  const opener = voiceById(thread.voice);
  const latest = latestReply(thread);
  const lastVoice = latest ? voiceById(latest.voice) : opener;
  return (
    <li>
      <Link className="topic-row" href={`/notes/${thread.slug}/`} id={thread.legacyId} prefetch={false}>
        <span aria-hidden="true" className={`voice-mark hue-${opener.hue}`}>{opener.mark}</span>
        <div className="topic-copy">
          {thread.pinned || thread.sample ? <div className="topic-flags">{thread.pinned ? <Badge>固定</Badge> : null}{thread.sample ? <Badge variant="outline">サンプル</Badge> : null}</div> : null}
          <h2>{thread.title}</h2>
          <p className="topic-excerpt">{thread.excerpt}</p>
          <p className="topic-meta">
            {thread.tags.map(tag => <span key={tag}>{tagMeta(tag).label}</span>)}
            <span>{opener.name}</span>
            <time dateTime={lastActivity(thread)}>{formatDay(lastActivity(thread))}</time>
            {latest ? <span>最後は{lastVoice.name}の{moves[latest.move].label}</span> : <span>まだ返信がない</span>}
          </p>
        </div>
        <p className="reply-count"><strong>{thread.replies.length}</strong><span>返信</span></p>
      </Link>
    </li>
  );
}

export function ForumBoard({ tag }: { tag?: string }) {
  const topics = tag ? threadsByTag(tag) : boardThreads;
  const current = tag ? tagMeta(tag) : null;
  const tags = usedTags();
  return (
    <>
      <header className="page-header forum-header">
        <p className="eyebrow">{current ? `TAG / ${current.label}` : 'NOTES / 会議室'}</p>
        <h1>{current ? current.label : <>机の上の、<br />会議室。</>}</h1>
        <p>{current ? current.blurb : '専門の住人が、読んだものに角度をつけて話す。要約、転用、自前、横から。名前のない感想は置かない。'}</p>
        <p className="forum-stats"><span>{topics.length} 話題</span><span>{replyCount(topics)} 返信</span><span>{voiceList.length} 人</span></p>
        <nav aria-label="話題のタグ" className="tag-rail">
          <Link aria-current={tag ? undefined : 'page'} href="/notes/">すべて<span className="tag-count">{boardThreads.length}</span></Link>
          {tags.map(item => <Link aria-current={item.slug === tag ? 'page' : undefined} href={`/notes/tag/${item.slug}/`} key={item.slug}>{item.label}<span className="tag-count">{item.count}</span></Link>)}
        </nav>
        {tag ? null : <ul aria-label="会議室の住人" className="resident-strip">{voiceList.map(voice => <li key={voice.id}><span aria-hidden="true" className={`voice-mark hue-${voice.hue}`}>{voice.mark}</span><span className="resident-copy"><strong>{voice.name}</strong><span>{voice.field}</span><span>{voice.line}</span></span></li>)}</ul>}
      </header>
      <ul className="topic-list">{topics.map(thread => <TopicRow key={thread.slug} thread={thread} />)}</ul>
    </>
  );
}
