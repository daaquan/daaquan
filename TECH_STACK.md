# daaquan.com の拡張に向けた技術構成案

2026-10-09。ユーザー承認後、Next.js / TypeScript / React / Tailwind / shadcn の基盤へ移行し公開済み。
MDX 記事、RSS、sitemap、AI Elements CodeBlock、黄色・黄褐色テーマを実装。
AI 接続・DB・CMS は今後の機能として扱う。

## ユーザー指定の方向性

黄色・黄褐色を軸にした黄色ベース。AI Elements のドキュメントを参考に、落ち着いた感じにする。
今後の作品展示、活動紹介、技術・AI 記事配信の追加を見据える。
ユーザーから実施を承認されたため、技術・AI の読者向けに、読みやすさを優先して進めた。

## 推奨構成

| 役割 | 採用案 | 理由 |
| --- | --- | --- |
| アプリ基盤 | Next.js App Router / TypeScript / React 19 | 作品・記事のページを分離し、後からサーバー側の機能を追加できる |
| スタイル | Tailwind CSS 4 / CSS variables | 共通テーマを管理し、AI Elements と同じ基盤にする |
| 汎用 UI | shadcn/ui | 必要な部品だけ導入し、テーマと部品コードを自分のサイトで管理する |
| AI の UI | AI Elements | 会話、引用、出典、入力、コード表示などを必要な機能ごとに導入する |
| AI 接続 | Vercel AI SDK | ストリーミングとモデル接続。実際の AI 機能を実装する時点で導入・設定する |
| 記事 | ローカル Markdown / MDX | 個人サイトの初期運用では Git で記事を管理。MDX なら記事内に React 部品を配置できる |
| RSS / sitemap | 記事の一覧からビルド時に生成 | 記事ページとフィードの二重管理を避ける |
| アニメーション | CSS transition を基本にする | 小さな反応と表示切り替えを軽量に実装。複雑な連動が必要になったら Motion を追加 |
| 初期公開 | Next.js static export → tanuki nginx | 現在の配信方式を使い、常駐 Node.js プロセスを増やさずに始める |
| DB | まだ導入しない | 記事と作品の公開には不要。購読、会員、保存データが必要になった時点で PostgreSQL 等を選ぶ |

AI Elements はサイト全体のテンプレートではなく、shadcn/ui の上にある AI 向けの部品集。
ホーム・作品・記事には共有テーマと必要な汎用部品を使い、AI 機能には AI Elements を使う。
技術記事のコード表示には、公式 CodeBlock 部品を早い段階から利用できる。
指定 URL のすっきりした情報整理を参考にする場合も、公式部品を使った箇所と独自レイアウトを区別する。

## 導入順

1. Next.js / TypeScript / Tailwind / shadcn の基盤と、共通のレイアウト・テーマを作る。
2. 作品情報と記事情報を HTML から分離し、トップ、記事一覧、記事詳細を作る。
3. MDX と記事メタデータから、RSS・sitemap・各記事の SEO 情報を生成する。
4. 必要な AI Elements 部品だけを追加する。記事のコード表示から始めてもよい。
5. 記事検索、作品フィルターなど、公開内容が増えてから必要になる機能を追加する。
6. 記事に根拠を紐づけた AI 質問機能等を追加するとき、AI SDK とサーバー実行環境を導入する。

記事は静的な Server Component を中心にし、検索、展開、コピー等だけを Client Component にする。
最初からチャット UI やモデル接続を作る必要はない。
AI Elements の全コンポーネントを一括導入せず、使う部品だけ管理する。

## 公開方式と制約

`output: 'export'` と `trailingSlash: true` を使えば、各ページを `out/<route>/index.html` に出力して nginx で配信できる。
`out/` 全体をリリースディレクトリに転送し、既存の `current` シンボリックリンクを切り替える方式を使える。
`ops/deploy.sh` はネストした `_next/` 等も含む `out/` 全体の転送に変更済み。

static export では POST API、Server Actions、動的な cookie 認証、ISR は使えない。
ビルド時に固定できる GET Route Handler は使用可能。
公開時に動く AI API が必要になったら、Next.js の Node.js 実行方式へ切り替えるか、専用 API を別途配信する。

このドメインには既存アプリの `/api/`、`/ws`、`/quant/`、`/updates/` が残っている。
将来の個人サイト用 API を `/api/chat` に置くと、現行 nginx の既存アプリ向け `/api/` に流れてしまう。
例えば `/site-api/chat` を独立した経路として設計し、AI UI の接続先と nginx を揃える。
変更対象は個人サイトの経路に限定し、既存アプリの経路を保持する。

## 現時点で確認した互換性

公式資料では AI Elements は React 19 と Tailwind CSS 4 を対象とし、Next.js App Router と shadcn/ui を前提としている。
2026-10-09 の npm 調査では Next.js 16.4.0 は Node.js >=20.9.0、AI SDK 7.0.136 は Node.js >=22。
本作業環境は Node.js 24.13.1。採用時に Node.js 24 系へ揃え、lockfile を保存する。
各パッケージは導入時に peer dependencies を確認して互換性のある組み合わせを固定する。
現在は Node.js 24 系でビルドし、package-lock.json に依存関係を固定。
tanuki には静的出力だけを配置し、Node.js の常駐プロセスは追加していない。

## デザイン／アニメーションの利用可能スキル

- `impeccable`: 配色、タイポグラフィ、レイアウト、アニメーション、アクセシビリティ。
- `design-taste-frontend`: ポートフォリオ、記事、ランディングページのデザイン。
- `refactoring-ui`: 階層、余白、色、UI テキストの調整。
- `high-end-visual-design`: 見た目の細部とアニメーションの設計。
- `prototype`: 複数の UI 案を試す。

`OpenDesign` という名前のスキルは、現在の利用可能一覧には存在しない。
AI Elements 自体も公式の coding-agent skill を提供しているが、このリポジトリには未導入。

## 一次資料

- [AI Elements Introduction](https://elements.ai-sdk.dev/docs)
- [AI Elements Setup](https://elements.ai-sdk.dev/docs/setup)
- [AI Frontend Stack](https://elements.ai-sdk.dev/docs/vercel-ai-frontend)
- [AI Elements CodeBlock](https://elements.ai-sdk.dev/components/code-block)
- [AI Elements Skill](https://elements.ai-sdk.dev/docs/skill)
- [shadcn/ui Next.js](https://ui.shadcn.com/docs/installation/next)
- [Next.js Static Exports](https://nextjs.org/docs/app/guides/static-exports)
- [Next.js MDX](https://nextjs.org/docs/app/guides/mdx)
