import type { MDXComponents } from 'mdx/types';
import { ArticleCode } from '@/components/article-code';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ArticleCode, ...components };
}
