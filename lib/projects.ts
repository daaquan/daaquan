import { defaultLocale, homePath, notePath } from '@/lib/locales';

export const projects = [
  {
    title: 'AI とつくる、小さな仕組み',
    description: '繰り返す作業を少し楽に。AI ワークフローやツールの実験を展示する場所。',
    category: 'AI / AUTOMATION',
    motif: 'idea → build.',
    variant: 'ochre',
    href: notePath(defaultLocale, 'ai-tools'),
    linkLabel: '実験ノートを読む',
    sample: true,
  },
  {
    title: '暮らしのための道具',
    description: 'タスクやメモを、もっと自然に。日常の小さな不便から生まれるもの。',
    category: 'WEB / EVERYDAY',
    motif: 'a little easier.',
    variant: 'yellow',
    href: `${homePath(defaultLocale)}#now`,
    linkLabel: 'いまのテーマを見る',
    sample: true,
  },
] as const;
