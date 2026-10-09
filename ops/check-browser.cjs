// Check the built site locally or the public production origin.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const origin = process.env.SITE_ORIGIN || 'https://daaquan.com';
  const cache = path.join(process.env.HOME, '.cache/ms-playwright');
  const installed = fs.readdirSync(cache).find(name => name.startsWith('chromium_headless_shell-'));
  const executablePath = process.env.CHROMIUM_PATH || (installed ? path.join(cache, installed, 'chrome-headless-shell-linux64/chrome-headless-shell') : undefined);
  const browser = await chromium.launch({ executablePath, headless: true });
  try {
    const page = await browser.newPage();
    const errors = [];
    let refusedSpeculation = 0;
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      // Cloudflare Speed Brain rejects ineligible speculative prefetches with
      // 503. Check actual navigation independently; do not hide other failures.
      if (response.status() === 503 && response.headers()['cf-speculation-refused'] && response.request().resourceType() === 'other') {
        refusedSpeculation++;
      } else if (response.status() >= 400) {
        errors.push(`${response.status()} ${response.url()}`);
      }
    });
    for (const width of [1440, 768, 390, 320]) {
      await page.setViewportSize({ width, height: 1000 });
      const response = await page.goto(`${origin}/ja/`, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      assert.match(await page.title(), /daaquan/);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `overflow at ${width}`);
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const accessibility = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
      assert.deepEqual(accessibility, [], `home accessibility at ${width}`);
      await page.locator('#note-ai').click();
      await page.waitForURL('**/ja/notes/ai-tools/');
      await page.waitForLoadState('networkidle');
      assert.match(await page.locator('h1').innerText(), /AI の新機能/);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `article overflow at ${width}`);
      await page.locator('.article-code pre:visible').waitFor();
      await page.locator('.article-code .shiki:visible').waitFor();
      await page.screenshot({ path: `/tmp/daaquan-article-${width}.png`, fullPage: true });
      await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
      const articleAccessibility = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
      assert.deepEqual(articleAccessibility, [], `article accessibility at ${width}`);
      await page.goto(`${origin}/ja/notes/`, { waitUntil: 'networkidle' });
      assert.match(await page.locator('h1').innerText(), /会議室/);
      assert.equal(await page.locator('.topic-row').count(), 5);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `notes overflow at ${width}`);
      if (width === 1440 || width === 390) {
        await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') });
        const notesAccessibility = await page.evaluate(async () => (await axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] } })).violations.map(v => ({ id: v.id, targets: v.nodes.map(n => n.target) })));
        assert.deepEqual(notesAccessibility, [], `notes accessibility at ${width}`);
      }
      await page.goto(`${origin}/ja/notes/tag/build/`, { waitUntil: 'networkidle' });
      assert.match(await page.locator('h1').innerText(), /開発/);
      assert.equal(await page.locator('.topic-row').count(), 1);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `tag overflow at ${width}`);
      await page.goto(`${origin}/ja/`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.activeElement.blur());
      await page.screenshot({ path: `/tmp/daaquan-${width}.png`, fullPage: true });
      console.log(`PASS ${width}px: homepage, article navigation, overflow, axe accessibility`);
    }
    await page.goto(`${origin}/ja/notes/ai-tools/`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('html').getAttribute('lang'), 'ja');
    assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://daaquan.com/ja/notes/ai-tools/');
    assert.equal(await page.locator('link[hreflang]').count(), 0);
    await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'コードをコピー' }).click();
    assert.match(await page.evaluate(() => navigator.clipboard.readText()), /const noteFormat/);
    assert.equal(await page.locator('.copy-status').innerText(), 'コピーしました');
    await page.context().clearPermissions();
    await page.evaluate(() => { Object.defineProperty(navigator.clipboard, 'writeText', { configurable: true, value: async () => { throw new Error('Denied'); } }); });
    await page.getByRole('button', { name: 'コードをコピー' }).click();
    assert.match(await page.locator('.copy-status').innerText(), /コピーできません/);
    const feed = await page.request.get(`${origin}/feed.xml`);
    assert.equal(feed.status(), 200);
    const feedXml = await feed.text();
    assert.match(feedXml, /<rss version="2.0"/);
    assert.match(feedXml, /<guid isPermaLink="false">tag:daaquan.com,2026:[0-9A-Za-z]{11}<\/guid>/);
    const feedData = await page.evaluate(xml => {
      const doc = new DOMParser().parseFromString(xml, 'application/xml');
      return { errors: doc.querySelectorAll('parsererror').length, links: [...doc.querySelectorAll('item link')].map(n => n.textContent) };
    }, feedXml);
    assert.equal(feedData.errors, 0);
    assert.equal(feedData.links.length, 5);
    assert.ok(feedData.links.some(link => link.endsWith('/ja/notes/ai-tools/')));
    assert.ok(feedData.links.some(link => link.endsWith('/ja/notes/angle-first/')));
    for (const link of feedData.links) {
      const url = new URL(link);
      const result = await page.goto(`${origin}${url.pathname}`, { waitUntil: 'networkidle' });
      assert.equal(result.status(), 200);
      assert.equal(await page.locator('article h1').count(), 1);
    }
    const sitemap = await (await page.request.get(`${origin}/sitemap.xml`)).text();
    assert.match(sitemap, /<loc>https:\/\/daaquan\.com\/ja\/notes\/ai-tools\/<\/loc>/);
    assert.doesNotMatch(sitemap, /<loc>https:\/\/daaquan\.com\/notes\//);
    assert.doesNotMatch(sitemap, /<loc>https:\/\/daaquan\.com\/<\/loc>/);
    assert.equal((await page.request.get(`${origin}/robots.txt`)).status(), 200);
    const missing = await page.request.get(`${origin}/not-a-real-page`);
    assert.equal(missing.status(), 404);
    assert.deepEqual(errors, []);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`${origin}/ja/`, { waitUntil: 'networkidle' });
    assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), 'auto');
    const noJs = await browser.newPage({ javaScriptEnabled: false });
    await noJs.goto(`${origin}/ja/notes/ai-tools/`);
    const legacy = await page.request.get(`${origin}/notes/ai-tools/`, { maxRedirects: 0 });
    if (legacy.status() === 301) {
      assert.match(legacy.headers().location, /\/ja\/notes\/ai-tools\/?$/);
      const root = await page.request.get(`${origin}/`, { maxRedirects: 0 });
      assert.equal(root.status(), 302);
      assert.match(root.headers().location, /\/ja\/?$/);
    } else {
      assert.equal(legacy.status(), 200);
      assert.match(await legacy.text(), /\/ja\/notes\/ai-tools\//);
    }
    assert.match(await noJs.locator('pre').first().innerText(), /const noteFormat/);
    await noJs.close();
    console.log(`PASS code copy and failure feedback, RSS XML and all article links, sitemap, robots, 404, reduced motion, no-JS code; no application errors. Cloudflare refused ${refusedSpeculation} speculative prefetches.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
