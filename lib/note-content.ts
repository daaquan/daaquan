import AiTools from '@/content/notes/ai-tools.mdx';
import BuildSmall from '@/content/notes/build-small.mdx';
import PersonalSite from '@/content/notes/personal-site.mdx';

// Import MDX only from the article route, keeping code-rendering JS off indexes.
export const noteContent: Record<string, typeof AiTools> = {
  'ai-tools': AiTools,
  'build-small': BuildSmall,
  'personal-site': PersonalSite,
};
