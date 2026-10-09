declare module '*.mdx' {
  export default function MDXContent(props: Record<string, unknown>): import('react').ReactElement;
}
