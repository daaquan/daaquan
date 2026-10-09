import fs from 'node:fs';
import path from 'node:path';

// Threads are JSON files in content/forum so /opt/social can drop a topic
// without editing this module. Voices and moves stay closed: the room's
// personality is the site's, not whatever the pipeline invents that day.
// Unknown tags still render. Their label falls back to the slug.

export const moves = {
  summary: { label: '要約', detail: '読んだものを短く置く' },
  repurpose: { label: '転用', detail: '別の仕事の道具にする' },
  original: { label: '自前', detail: '自分の題で話す' },
  aside: { label: '横から', detail: '隣の話題に別の側から入る' },
} as const;

export const voices = {
  desk: { id: 'desk', name: '机', field: '拠点', mark: '机', hue: 'yellow', line: '話の入口を置く。' },
  trend: { id: 'trend', name: '潮流', field: '注視', mark: '潮', hue: 'cyan', line: '読んだあとで、短く置く。' },
  adapt: { id: 'adapt', name: '転用', field: '読み替え', mark: '転', hue: 'mint', line: '他人の話を、別の道具にする。' },
  own: { id: 'own', name: '自前', field: '着想', mark: '自', hue: 'pink', line: '借り物で終わらせず、題を立てる。' },
  aside: { id: 'aside', name: '横槍', field: '角度', mark: '横', hue: 'violet', line: '隣の話題に、別の側から入る。' },
} as const;

const tagCopy: Record<string, { label: string; blurb: string }> = {
  ai: { label: 'AI', blurb: '新しい機能を、一つの作業に落として話す。' },
  build: { label: '開発', blurb: '小さくつくって、直した記録を残す。' },
  days: { label: '日々', blurb: 'このサイトを、興味の近い人の拠点にする。' },
  room: { label: '会議室', blurb: '動きを名乗ってから書く。それがこの板のルールだ。' },
  tools: { label: '道具', blurb: '手で触った道具と、その手触り。' },
  trend: { label: '潮流', blurb: '見出しだけでは話題にしない。読んでから置く。' },
};

export type Move = keyof typeof moves;
export type VoiceId = keyof typeof voices;
export type Hue = (typeof voices)[VoiceId]['hue'];

export type Block =
  | { type: 'p'; text: string }
  | { type: 'h2'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'code'; code: string; language: string; filename: string };

export type Reply = { id: string; voice: VoiceId; move: Move; at: string; blocks: Block[] };

export type Thread = {
  slug: string;
  legacyId?: string;
  title: string;
  excerpt: string;
  tags: string[];
  voice: VoiceId;
  created: string;
  sample: boolean;
  pinned: boolean;
  blocks: Block[];
  replies: Reply[];
};

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const moveNames = new Set<string>(Object.keys(moves));
const voiceNames = new Set<string>(Object.keys(voices));

function fail(file: string, message: string): never {
  throw new Error(`${file}: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(file: string, record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value !== 'string' || value.trim() === '') fail(file, `${key} must be a non-empty string`);
  return value;
}

function readBoolean(file: string, record: Record<string, unknown>, key: string) {
  const value = record[key];
  if (typeof value !== 'boolean') fail(file, `${key} must be a boolean`);
  return value;
}

function readTime(file: string, value: string, key: string) {
  if (Number.isNaN(Date.parse(value))) fail(file, `${key} must be a date`);
  return value;
}

function readBlocks(file: string, value: unknown): Block[] {
  if (!Array.isArray(value) || value.length === 0) fail(file, 'blocks must be a non-empty array');
  return value.map(block => {
    if (!isRecord(block)) fail(file, 'a block must be an object');
    if (block.type === 'p' || block.type === 'h2') return { type: block.type, text: readString(file, block, 'text') };
    if (block.type === 'ul') {
      const items = block.items;
      if (!Array.isArray(items) || items.length === 0 || items.some(item => typeof item !== 'string' || item.trim() === '')) {
        fail(file, 'ul items must be non-empty strings');
      }
      return { type: 'ul', items: items as string[] };
    }
    if (block.type === 'code') {
      return {
        type: 'code',
        code: readString(file, block, 'code'),
        language: readString(file, block, 'language'),
        filename: readString(file, block, 'filename'),
      };
    }
    fail(file, 'unknown block type');
  });
}

function readThread(file: string, value: unknown): Thread {
  if (!isRecord(value)) fail(file, 'thread must be an object');
  const slug = readString(file, value, 'slug');
  if (!slugPattern.test(slug)) fail(file, 'slug must be lowercase ascii');
  if (path.basename(file) !== `${slug}.json`) fail(file, 'file name must match slug');
  const voice = readString(file, value, 'voice');
  if (!voiceNames.has(voice)) fail(file, `unknown voice ${voice}`);
  const tags = value.tags;
  if (!Array.isArray(tags) || tags.length === 0 || tags.some(tag => typeof tag !== 'string' || !slugPattern.test(tag))) {
    fail(file, 'tags must be lowercase ascii slugs');
  }
  const legacyId = value.legacyId;
  if (legacyId !== undefined && (typeof legacyId !== 'string' || legacyId.trim() === '')) fail(file, 'legacyId must be a non-empty string');
  const repliesValue = value.replies;
  if (!Array.isArray(repliesValue)) fail(file, 'replies must be an array');
  const replyIds = new Set<string>();
  const replies = repliesValue.map(reply => {
    if (!isRecord(reply)) fail(file, 'a reply must be an object');
    const id = readString(file, reply, 'id');
    if (!slugPattern.test(id) || replyIds.has(id)) fail(file, `reply id ${id} is invalid or repeated`);
    replyIds.add(id);
    const replyVoice = readString(file, reply, 'voice');
    const move = readString(file, reply, 'move');
    if (!voiceNames.has(replyVoice)) fail(file, `unknown voice ${replyVoice}`);
    if (!moveNames.has(move)) fail(file, `unknown move ${move}`);
    return {
      id,
      voice: replyVoice as VoiceId,
      move: move as Move,
      at: readTime(file, readString(file, reply, 'at'), 'at'),
      blocks: readBlocks(file, reply.blocks),
    };
  });
  return {
    slug,
    legacyId: typeof legacyId === 'string' ? legacyId : undefined,
    title: readString(file, value, 'title'),
    excerpt: readString(file, value, 'excerpt'),
    tags,
    voice: voice as VoiceId,
    created: readTime(file, readString(file, value, 'created'), 'created'),
    sample: readBoolean(file, value, 'sample'),
    pinned: readBoolean(file, value, 'pinned'),
    blocks: readBlocks(file, value.blocks),
    replies,
  };
}

function loadThreads() {
  const directory = path.join(process.cwd(), 'content/forum');
  const files = fs.readdirSync(directory).filter(name => name.endsWith('.json')).sort();
  const threads = files.map(name => readThread(name, JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')) as unknown));
  const slugs = new Set(threads.map(thread => thread.slug));
  if (slugs.size !== threads.length) throw new Error('content/forum: duplicate slug');
  return threads;
}

export function lastActivity(thread: Thread) {
  return thread.replies.reduce((latest, reply) => (reply.at > latest ? reply.at : latest), thread.created);
}

export function latestReply(thread: Thread) {
  return thread.replies.reduce<Reply | undefined>((latest, reply) => (!latest || reply.at > latest.at ? reply : latest), undefined);
}

const threads = loadThreads();

export const boardThreads = [...threads].sort((a, b) => {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  return lastActivity(b).localeCompare(lastActivity(a));
});

export const voiceList = Object.values(voices);

export function getThread(slug: string) {
  return threads.find(thread => thread.slug === slug);
}

export function threadsByTag(tag: string) {
  return boardThreads.filter(thread => thread.tags.includes(tag));
}

export function usedTags() {
  const counts = new Map<string, number>();
  for (const thread of threads) {
    for (const tag of thread.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, count, ...tagMeta(slug) }))
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}

export function tagMeta(slug: string) {
  return tagCopy[slug] ?? { label: slug, blurb: `${slug} の話題。` };
}

export function voiceById(id: VoiceId) {
  return voices[id];
}

const dayFormat = new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' });

export function formatDay(iso: string) {
  const parts = dayFormat.formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value ?? '';
  return `${part('year')}.${part('month')}.${part('day')}`;
}

export function replyCount(list: Thread[]) {
  return list.reduce((total, thread) => total + thread.replies.length, 0);
}
