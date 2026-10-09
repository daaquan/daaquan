# daaquan.com サンプルサイト

Next.js 16.4 / React 19.3 / TypeScript / Tailwind CSS 4.3 の静的出力サイト。
汎用 UI は shadcn/ui、記事のコード表示は AI Elements の公式 CodeBlock を使用。
黄色・黄褐色のテーマと、控えめな操作時のアニメーション。
ビルド結果 `out/` を tanuki の nginx で配信。常駐 Node.js アプリは不要。
GitHub プロフィール用の README は保持。初期 HTML サンプルは `archive/static-sample/` に保存。

## 内容

- 作品の展示（2件のサンプル）
- ノートは会議室。話題一覧、タグ別の板、話題と住人の返信（JSON）
- いま取り組んでいること
- GitHub プロフィールへのリンク
- `/feed.xml` の RSS フィード（会議室の話題。返信が付くと pubDate が進む。購読 URL はルートのまま）
- `/sitemap.xml` と `/robots.txt`
- AI Elements のコード表示・コピー・コピー失敗時の案内

ニュース自動収集、記事管理画面、メール配信は未実装。
実際の作品名・活動・記事は、本人の内容に置き換える。

## 編集と公開

Node.js 24 系。依存関係は `npm ci`、開発は `npm run dev`。
`npm run build` で静的ファイルを出力、`npm run typecheck` で型を確認する。

- ホーム・活動: `app/[locale]/page.tsx`（公開中の言語は `ja` `en` `zh`。`/` は `/ja/` への一時リダイレクト）
- UI の文言: `lib/copy.ts`
- 記事の英訳・中訳: `content/i18n/en.json` と `content/i18n/zh.json`（本文の型と返信 id は日本語の原稿に合わせる。コードはそのまま）
- 作品情報: `lib/projects.ts`
- 会議室の話題: `content/forum/*.json`（ファイル名は slug と一致）
- 住人、動き、読み込み: `lib/forum.ts`
- 見た目: `app/globals.css`（shadcn/ui と共有する OKLCH テーマ）
- ブランドと設計方針: `PRODUCT.md` / `DESIGN.md`

話題の追加は `content/forum/<slug>.json` を置く。一覧、タグ板、詳細、RSS、sitemap は同じ JSON から生成する。
公開 URL は `/ja/notes/<slug>/`、`/en/notes/<slug>/`、`/zh/notes/<slug>/`。slug は言語で分けない。`id` は11文字の英数字で、一度決めたら変えない。RSS の guid は `tag:daaquan.com,2026:<id>`。
`slug` は公開後に凍結する。変えるときは古い slug を `aliases` に残し、そのパスは新しい slug へ 301 する。
`publishedLocales` は `ja` `en` `zh`。ここに無い言語は URL にならない。
hreflang は公開中の言語と `x-default`（日本語）を相互に出す。言語の自動リダイレクトはしない。フッターの言語切替は、同じページの別言語への通常のリンク。表示名は 日本語 / English / 中文 のまま。
`/notes/...` は `/ja/notes/...` へ 301 する。`/` は `/ja/` へ 302 する。302 なのは、あとから言語の入口に戻せるようにするため。
自己改善ループは入れない。slug や公開言語の変更は、このリポジトリの明示的なデータとしてだけ行う。
返信には `summary`（要約）、`repurpose`（転用）、`original`（自前）、`aside`（横から）のどれかを付ける。
住人は `desk` `trend` `adapt` `own` `aside`。サンプルのまま見せる話題は `sample: true`。
`/opt/social` の `scripts/salon_export.py` は、Markdown の記事をこの JSON に変換する。公開の自動投稿は、そちらの公開ゲートが開いてからつなぐ。
作品の `sample` は展示サンプル表示に使用。現時点の作品はすべてサンプル。

公開は `npm run deploy`。SSH の `tanuki` とパスワード不要の sudo が必要。
ビルドと型チェックが成功した `out/` 全体を転送する。
公開先は `/var/www/daaquan/releases/<UTC timestamp>/`。
`/var/www/daaquan/current` を切り替え、nginx の設定検証後に reload する。
検証に失敗した場合、直前の設定とリンクを戻す。
nginx 設定のバックアップは `/etc/nginx/conf.d/daaquan.conf.bak-<timestamp>`。

`ops/daaquan.conf` は実機設定の参考スナップショット。
公開スクリプトはこのファイル全体を上書きせず、実機の個人サイト用 static root の存在を検証する。
必要な場合に静的サイトの 404 ページ設定だけを加え、既存の `/api/`、`/ws`、
`/quant/`、`/updates/` の upstream 設定を保持する。
前のビルドのハッシュ付き static assets も引き継ぎ、公開中に開いていたタブの読み込みに備える。
`/site-build.json` の release 値で、公開先とビルド結果の一致を確認する。
Cloudflare が HTTPS を終端し、tanuki nginx の 80 番で静的ページを配信。

## 確認

2026-10-09: tanuki に release `20261009T091330Z` を公開済み。
本番ビルド、型チェック、nginx 設定検証・reload 成功。
公開 HTTPS と `/site-build.json` の release 値を確認。
nginx の実機差分は静的 location に追加した `error_page 404 /404.html;` の1行のみ。
公開 URL で下記ブラウザー確認はすべて成功。
ソースは GitHub の `daaquan/daaquan` リポジトリで管理する。
公開リリース ID と Git コミットは別の識別子として確認する。

`npm run check:browser` は Playwright と Chromium を使用。
キャッシュ済み headless shell がある場合は使用し、なければ Playwright 標準の Chromium を使用。
準備が必要な環境では `npx playwright install chromium`。
任意のブラウザー実行ファイルを `CHROMIUM_PATH` で指定可能。
ローカル静的配信の確認には `SITE_ORIGIN=http://127.0.0.1:<port> npm run check:browser`。

検証内容: 1440/768/390/320px の横はみ出し、記事への遷移、axe による WCAG A/AA タグの検査、
コードのコピーと失敗時の案内、RSS XML の構文と全記事への直リンク、sitemap、robots、404、
reduced motion、JavaScript 無効時の本文・コード表示、アプリケーションエラー。
スクリーンショットは `/tmp/daaquan-<width>.png` と `/tmp/daaquan-article-<width>.png`。
axe は自動検査で、すべての WCAG 要件を保証するものではない。

公開経路には Cloudflare Speed Brain があり、先読みで `cf-speculation-refused` 付きの 503 が返る。
通常のページ読み込みは成功。検査はこのヘッダー付きの speculative request だけを分類し、
そのほかの 400 以上の応答は失敗として扱う。
[Cloudflare Speed Brain の仕様](https://developers.cloudflare.com/speed/optimization/content/speed-brain/)。

初回のブラウザー検査でコードの標準配色にコントラスト不足を検出し、高コントラストテーマへ修正。
長い記事タイトルの改行も調整した。コードは強調表示前・JS 無効時にも plain text で読める。
AI Elements 公式部品には、そのための fallback と、非同期処理の cleanup を追加した。
トップでのコード用 JS 読み込みを除き、同じローカル環境の初回読み込みの JS は約725KBから496KBへ減少。
これは展開後の resource size。回線速度や実ユーザーの性能の評価ではない。

## 次のアイデア

- 実験室: ブラウザーで触れる小さな AI・ツールのデモ
- 開発ログ: 判断、失敗、改善の記録。完成前から公開できる
- Now ページ: 今月の活動、学び、関心を短く更新
- 道具箱: 愛用ツール、本、参考資料に自分のコメントを添える
- 月刊まとめ: 作品・記事・発見を RSS やメールで届ける
- 相談・共同制作: 関心分野と連絡方法を明示する

まずは作品1件と実際の記事1本に置き換え、更新を続けられる形を決める。
