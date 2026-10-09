import fs from 'node:fs';
import path from 'node:path';

const root = path.join(import.meta.dirname, '..');
const out = path.join(root, 'out');
const forum = path.join(root, 'content', 'forum');

function threads() {
  return fs.readdirSync(forum)
    .filter(name => name.endsWith('.json'))
    .map(name => JSON.parse(fs.readFileSync(path.join(forum, name), 'utf8')));
}

function nginxBlock(topics) {
  const aliases = [];
  for (const topic of topics) {
    for (const alias of topic.aliases ?? []) {
      aliases.push(`    rewrite ^/${topic.locale}/notes/${alias}/?$ https://daaquan.com/${topic.locale}/notes/${topic.slug}/ permanent;`);
      aliases.push(`    rewrite ^/notes/${alias}/?$ https://daaquan.com/${topic.locale}/notes/${topic.slug}/ permanent;`);
    }
  }
  return [
    '    # daaquan-locale-redirects',
    '    location = / {',
    '        return 302 https://daaquan.com/ja/;',
    '    }',
    '    rewrite ^/notes/?$ https://daaquan.com/ja/notes/ permanent;',
    '    rewrite ^/notes/(.+)$ https://daaquan.com/ja/notes/$1 permanent;',
    ...aliases,
    '    # /daaquan-locale-redirects',
    '',
  ].join('\n');
}

function redirectHtml(target) {
  const absolute = `https://daaquan.com${target}`;
  return `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<link rel="canonical" href="${absolute}">
<meta http-equiv="refresh" content="0; url=${target}">
<title>Moved</title>
</head>
<body>
<p><a href="${target}">このページは移動しました。</a></p>
</body>
</html>
`;
}

function writeRedirect(relativeDir, target) {
  const file = path.join(out, relativeDir, 'index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, redirectHtml(target));
}

function writeHtml(topics) {
  writeRedirect('notes', '/ja/notes/');
  const tags = new Set();
  for (const topic of topics) {
    const target = `/${topic.locale}/notes/${topic.slug}/`;
    writeRedirect(`notes/${topic.slug}`, target);
    for (const alias of topic.aliases ?? []) {
      writeRedirect(`notes/${alias}`, target);
      writeRedirect(`${topic.locale}/notes/${alias}`, target);
    }
    for (const tag of topic.tags ?? []) tags.add(tag);
  }
  for (const tag of tags) writeRedirect(`notes/tag/${tag}`, `/ja/notes/tag/${tag}/`);
  stampLang();
}

function stampLang() {
  const walk = directory => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const full = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(full);
        continue;
      }
      if (!entry.name.endsWith('.html')) continue;
      const locale = path.relative(out, full).split(path.sep)[0];
      if (locale !== 'ja' && locale !== 'en') continue;
      const html = fs.readFileSync(full, 'utf8').replace(/<html lang="[^"]*"/, `<html lang="${locale}"`);
      fs.writeFileSync(full, html);
    }
  };
  walk(out);
}

const topics = threads();
const command = process.argv[2];
if (command === 'nginx') {
  process.stdout.write(nginxBlock(topics));
} else if (command === 'html') {
  writeHtml(topics);
} else {
  console.error('usage: node ops/locale-redirects.mjs nginx|html');
  process.exit(1);
}
