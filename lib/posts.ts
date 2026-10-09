import type { PostMetadata } from '@/lib/types';

export const posts = [
  { slug: 'ai-tools', legacyId: 'note-ai', title: 'AI の新機能は「何が変わるか」から考える', description: 'ニュースを読むだけでなく、一つの作業で試してみる。使い道から考える実験ノート。', category: 'AI', date: '2026-10-09', sample: true },
  { slug: 'build-small', legacyId: 'note-build', title: '小さくつくって、毎日使って、直していく', description: '完成報告だけでなく、途中の判断や失敗も残す。小さな道具の育て方。', category: '開発ログ', date: '2026-10-09', sample: true },
  { slug: 'personal-site', legacyId: 'note-site', title: '自分のホームページを、小さな拠点にする', description: '作品、活動、技術のメモ。興味の近い人が、ひと続きでたどれる場所へ。', category: '日々のメモ', date: '2026-10-09', sample: true },
] satisfies PostMetadata[];

export function getPost(slug: string) {
  return posts.find(post => post.slug === slug);
}
