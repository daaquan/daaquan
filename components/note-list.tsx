import Link from 'next/link';
import { posts } from '@/lib/posts';

export function NoteList({ descriptions = false }: { descriptions?: boolean }) {
  return <div className="note-list">{posts.map(post => (
    <Link className="note-row" prefetch={false} href={`/notes/${post.slug}/`} key={post.slug} id={post.legacyId}>
      <div className="note-row-meta"><span>{post.category}</span><span>{post.sample ? 'サンプル記事' : post.date}</span></div>
      <div className="note-row-copy"><h3>{post.title}</h3>{descriptions ? <p>{post.description}</p> : null}</div>
      <span aria-hidden="true" className="note-arrow">↗</span>
    </Link>
  ))}</div>;
}
