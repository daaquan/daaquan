import type { BundledLanguage } from 'shiki';
import { ArticleCode } from '@/components/article-code';
import { copy } from '@/lib/copy';
import type { Block } from '@/lib/forum';
import type { Locale } from '@/lib/locales';

function safeHref(href: string) {
  if (href.startsWith('/') && !href.startsWith('//')) return href;
  try {
    const url = new URL(href);
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href;
  } catch {
    return null;
  }
  return null;
}

export function RichText({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\]\([^)\s]+\))/g);
  return parts.map((part, index) => {
    const match = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (!match) return <span key={index}>{part}</span>;
    const href = safeHref(match[2]);
    if (!href) return <span key={index}>{match[1]}</span>;
    const external = href.startsWith('http');
    return <a key={index} href={href} {...(external ? { rel: 'noreferrer', target: '_blank' } : {})}>{match[1]}{external ? ' ↗' : ''}</a>;
  });
}

export function Blocks({ blocks, locale }: { blocks: Block[]; locale: Locale }) {
  const labels = { copy: copy[locale].copy, copied: copy[locale].copied, failed: copy[locale].copyFailed };
  return blocks.map((block, index) => {
    if (block.type === 'p') return <p key={index}><RichText text={block.text} /></p>;
    if (block.type === 'h2') return <h2 key={index}>{block.text}</h2>;
    if (block.type === 'ul') return <ul key={index}>{block.items.map(item => <li key={item}><RichText text={item} /></li>)}</ul>;
    return <ArticleCode key={index} code={block.code} filename={block.filename} labels={labels} language={block.language as BundledLanguage} />;
  });
}
