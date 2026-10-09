import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { SiteShell } from '@/components/site-shell';
import { posts, getPost } from '@/lib/posts';
import { noteContent } from '@/lib/note-content';

export const dynamicParams = false;
export function generateStaticParams() { return posts.map(post => ({ slug: post.slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return { title: post.title, description: post.description, alternates: { canonical: `/notes/${post.slug}/` }, openGraph: { title: post.title, description: post.description, type: 'article', publishedTime: post.date } };
}

export default async function NotePage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const Content = noteContent[post.slug];
  if (!Content) notFound();
  return <SiteShell active="notes"><article className="article-page"><Link className="text-link back-link" href="/notes/">← ノート一覧</Link><header className="article-header"><div className="article-meta"><span>{post.category}</span><time dateTime={post.date}>{post.date.replaceAll('-', '.')}</time>{post.sample ? <Badge variant="outline">サンプル記事</Badge> : null}</div><h1>{post.title}</h1><p className="article-lead">{post.description}</p>{post.sample ? <p className="article-sample">掲載形式を確認するためのサンプルです。</p> : null}</header><div className="prose"><Content /></div><div className="article-end"><Link className="text-link" href="/notes/">← ほかのノートを読む</Link><a className="text-link" href="/feed.xml">RSS で更新を読む ↗</a></div></article></SiteShell>;
}
