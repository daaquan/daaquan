import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { copy } from '@/lib/copy';
import { formatDay, lastActivity, latestReply, moveMeta, replyCount, tagMeta, threadsByTag, threadsFor, usedTags, voiceById, voiceListFor, type Thread } from '@/lib/forum';
import { notesPath, tagPath, notePath, type Locale } from '@/lib/locales';

function TopicRow({ thread }: { thread: Thread }) {
  const text = copy[thread.locale];
  const opener = voiceById(thread.locale, thread.voice);
  const latest = latestReply(thread);
  const lastVoice = latest ? voiceById(thread.locale, latest.voice) : opener;
  return (
    <li>
      <Link className="topic-row" href={notePath(thread.locale, thread.slug)} id={thread.legacyId} prefetch={false}>
        <span aria-hidden="true" className={`voice-mark hue-${opener.hue}`}>{opener.mark}</span>
        <div className="topic-copy">
          {thread.pinned || thread.sample ? <div className="topic-flags">{thread.pinned ? <Badge>{text.pinned}</Badge> : null}{thread.sample ? <Badge variant="outline">{text.sample}</Badge> : null}</div> : null}
          <h2>{thread.title}</h2>
          <p className="topic-excerpt">{thread.excerpt}</p>
          <p className="topic-meta">
            {thread.tags.map(tag => <span key={tag}>{tagMeta(thread.locale, tag).label}</span>)}
            <span>{opener.name}</span>
            <time dateTime={lastActivity(thread)}>{formatDay(lastActivity(thread), thread.locale)}</time>
            {latest ? <span>{text.lastReply(lastVoice.name, moveMeta(thread.locale, latest.move).label)}</span> : <span>{text.noReplies}</span>}
          </p>
        </div>
        <p className="reply-count"><strong>{thread.replies.length}</strong><span>{text.replies}</span></p>
      </Link>
    </li>
  );
}

export function ForumBoard({ locale, tag }: { locale: Locale; tag?: string }) {
  const text = copy[locale];
  const topics = tag ? threadsByTag(locale, tag) : threadsFor(locale);
  const current = tag ? tagMeta(locale, tag) : null;
  const tags = usedTags(locale);
  return (
    <>
      <header className="page-header forum-header">
        <p className="eyebrow">{current ? `TAG / ${current.label}` : text.boardEyebrow}</p>
        <h1>{current ? current.label : <>{text.boardTitleLead}<br />{text.boardTitle}</>}</h1>
        <p>{current ? current.blurb : text.boardIntro}</p>
        <p className="forum-stats"><span>{text.topics(topics.length)}</span><span>{text.replyStat(replyCount(topics))}</span><span>{text.people(voiceListFor(locale).length)}</span></p>
        <nav aria-label={text.tagsLabel} className="tag-rail">
          <Link aria-current={tag ? undefined : 'page'} href={notesPath(locale)}>{text.allTags}<span className="tag-count">{threadsFor(locale).length}</span></Link>
          {tags.map(item => <Link aria-current={item.slug === tag ? 'page' : undefined} href={tagPath(locale, item.slug)} key={item.slug}>{item.label}<span className="tag-count">{item.count}</span></Link>)}
        </nav>
        {tag ? null : <ul aria-label={text.residentsLabel} className="resident-strip">{voiceListFor(locale).map(voice => <li key={voice.id}><span aria-hidden="true" className={`voice-mark hue-${voice.hue}`}>{voice.mark}</span><span className="resident-copy"><strong>{voice.name}</strong><span>{voice.field}</span><span>{voice.line}</span></span></li>)}</ul>}
      </header>
      <ul className="topic-list">{topics.map(thread => <TopicRow key={thread.slug} thread={thread} />)}</ul>
    </>
  );
}
