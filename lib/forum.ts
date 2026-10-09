import fs from 'node:fs';
import path from 'node:path';
import { copy } from '@/lib/copy';
import { defaultLocale, publishedLocales, type Locale } from '@/lib/locales';

// Threads are JSON files in content/forum so /opt/social can drop a topic
// without editing this module. Voices and moves stay closed: the room's
// personality is the site's, not whatever the pipeline invents that day.
// Unknown tags still render. Their label falls back to the slug.
//
// `id` never changes. `slug` is frozen after publish; a rename must list the
// previous slug in `aliases`, and those paths redirect. Public locales live
// in lib/locales.ts. A later self-improvement loop may propose a slug or a
// translation, but it does not publish by rewriting these rules.

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
  id: string;
  locale: Locale;
  slug: string;
  aliases: string[];
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
const idPattern = /^[0-9A-Za-z]{11}$/;
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
  const id = readString(file, value, 'id');
  if (!idPattern.test(id)) fail(file, 'id must be 11 letters or digits');
  const locale = readString(file, value, 'locale');
  if (locale !== defaultLocale) fail(file, 'source threads stay in the default locale');
  const aliases = readAliases(file, value.aliases, slug);
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
    id,
    locale: locale as Locale,
    slug,
    aliases,
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

function readAliases(file: string, value: unknown, slug: string) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.some(alias => typeof alias !== 'string' || !slugPattern.test(alias) || alias === slug)) {
    fail(file, 'aliases must be other lowercase ascii slugs');
  }
  if (new Set(value).size !== value.length) fail(file, 'aliases must be unique');
  return value as string[];
}

function loadThreads() {
  const directory = path.join(process.cwd(), 'content/forum');
  const files = fs.readdirSync(directory).filter(name => name.endsWith('.json')).sort();
  const threads = files.map(name => readThread(name, JSON.parse(fs.readFileSync(path.join(directory, name), 'utf8')) as unknown));
  const ids = new Set<string>();
  const paths = new Set<string>();
  for (const thread of threads) {
    if (ids.has(thread.id)) throw new Error(`content/forum: duplicate id ${thread.id}`);
    ids.add(thread.id);
    for (const name of [thread.slug, ...thread.aliases]) {
      const key = `${thread.locale}/${name}`;
      if (paths.has(key)) throw new Error(`content/forum: duplicate path ${key}`);
      paths.add(key);
    }
  }
  loadOverlays(threads);
  return threads;
}

function readOverlayBlocks(file: string, value: unknown, source: Block[]): Block[] {
  if (!Array.isArray(value) || value.length !== source.length) fail(file, 'blocks must match the source');
  return value.map((block, index) => {
    const origin = source[index];
    if (!isRecord(block) || block.type !== origin.type) fail(file, `block ${index} must stay ${origin.type}`);
    if (origin.type === 'code') {
      if (Object.keys(block).length !== 1) fail(file, 'code blocks stay in the source');
      return origin;
    }
    if (origin.type === 'p' || origin.type === 'h2') return { type: origin.type, text: readString(file, block, 'text') };
    const items = block.items;
    if (!Array.isArray(items) || items.length !== origin.items.length || items.some(item => typeof item !== 'string' || item.trim() === '')) {
      fail(file, `list at block ${index} must match the source`);
    }
    return { type: 'ul', items: items as string[] };
  });
}

function loadOverlays(threads: Thread[]) {
  const slugs = new Set(threads.map(thread => thread.slug));
  for (const locale of publishedLocales) {
    if (locale === defaultLocale) continue;
    const file = `content/i18n/${locale}.json`;
    const full = path.join(process.cwd(), file);
    const value = JSON.parse(fs.readFileSync(full, 'utf8')) as unknown;
    if (!isRecord(value)) fail(file, 'overlay must be an object');
    const keys = Object.keys(value);
    if (keys.length !== slugs.size || keys.some(key => !slugs.has(key))) fail(file, 'slugs must match the source threads');
    for (const thread of threads) {
      const entry = value[thread.slug];
      if (!isRecord(entry) || !isRecord(entry.replies)) fail(file, `${thread.slug} needs title, blocks, and replies`);
      const replyIds = thread.replies.map(reply => reply.id);
      const overlayIds = Object.keys(entry.replies);
      if (overlayIds.length !== replyIds.length || overlayIds.some(id => !replyIds.includes(id))) fail(file, `${thread.slug} reply ids must match`);
      readOverlayBlocks(file, entry.blocks, thread.blocks);
      readString(file, entry, 'title');
      readString(file, entry, 'excerpt');
      for (const reply of thread.replies) readOverlayBlocks(`${file}#${reply.id}`, entry.replies[reply.id], reply.blocks);
    }
    overlays.set(locale, value);
  }
}

const overlays = new Map<Locale, Record<string, unknown>>();

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

const localized = new Map<string, Thread>();

function localize(thread: Thread, locale: Locale): Thread {
  if (locale === defaultLocale) return thread;
  const key = `${locale}/${thread.id}`;
  const cached = localized.get(key);
  if (cached) return cached;
  const file = `content/i18n/${locale}.json`;
  const table = overlays.get(locale);
  const entry = table?.[thread.slug];
  const replies = isRecord(entry) ? entry.replies : undefined;
  if (!isRecord(entry) || !isRecord(replies)) fail(file, `missing ${thread.slug}`);
  const next: Thread = {
    ...thread,
    locale,
    title: readString(file, entry, 'title'),
    excerpt: readString(file, entry, 'excerpt'),
    blocks: readOverlayBlocks(file, entry.blocks, thread.blocks),
    replies: thread.replies.map(reply => ({ ...reply, blocks: readOverlayBlocks(file, replies[reply.id], reply.blocks) })),
  };
  localized.set(key, next);
  return next;
}

export function threadsFor(locale: Locale) {
  return boardThreads.map(thread => localize(thread, locale));
}

export function getThread(locale: Locale, slug: string) {
  const thread = threads.find(item => item.slug === slug);
  return thread ? localize(thread, locale) : undefined;
}

export function threadsByTag(locale: Locale, tag: string) {
  return threadsFor(locale).filter(thread => thread.tags.includes(tag));
}

export function usedTags(locale: Locale) {
  const counts = new Map<string, number>();
  for (const thread of threadsFor(locale)) {
    for (const tag of thread.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([slug, count]) => ({ slug, count, ...tagMeta(locale, slug) }))
    .sort((a, b) => b.count - a.count || a.slug.localeCompare(b.slug));
}

export function tagMeta(locale: Locale, slug: string) {
  const tags = copy[locale].tags;
  if (Object.hasOwn(tags, slug)) return tags[slug as keyof typeof tags];
  return { label: slug, blurb: copy[locale].unknownTag(slug) };
}

export function moveMeta(locale: Locale, move: Move) {
  return copy[locale].moves[move];
}

export function voiceById(locale: Locale, id: VoiceId) {
  const base = voices[id];
  const text = copy[locale].voices[id];
  return { ...base, name: text.name, field: text.field, line: text.line };
}

export function voiceListFor(locale: Locale) {
  return voiceList.map(voice => voiceById(locale, voice.id));
}

const dayFormats: Record<Locale, Intl.DateTimeFormat> = {
  ja: new Intl.DateTimeFormat('ja-JP', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }),
  en: new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }),
  zh: new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit' }),
};

export function formatDay(iso: string, locale: Locale = defaultLocale) {
  const parts = dayFormats[locale].formatToParts(new Date(iso));
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(item => item.type === type)?.value ?? '';
  return `${part('year')}.${part('month')}.${part('day')}`;
}

export function replyCount(list: Thread[]) {
  return list.reduce((total, thread) => total + thread.replies.length, 0);
}
