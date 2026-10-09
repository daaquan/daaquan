# Design

2026-10-09: TypeUI Neobrutalism の Application を基準に全面リニューアル。

## Reference

- https://www.typeui.sh/design-skills/neobrutalism
- 実際の Application プレビュー: https://neobrutalism-typeui-89bf9fa5.vercel.app/application
- refactoring-ui: 情報階層、コンポーネントの用途、日本語の読みやすさ、レスポンシブとアクセシビリティに適用。

公開説明の黄色・紫だけでなく、Application プレビューのクリーム、黄色、水色、ミント、ピンクを優先する。
参照先は売上管理のデモだが、このサイトは作品とノートを公開する個人サイト。ショートカットの件数は実際のコンテンツ定義から算出し、サンプル表示を保つ。

## Tokens

app/globals.css をテーマの唯一の定義元とする。
背景 #fff4cc、面 #fffef5、本文 #1c293c、枠線 #171717。
黄色 #ffe500、薄黄色 #fff06a、水色 #69c9fa、ミント #86ecae、ピンク #fa68a4。
リンクとフォーカスに紫 #432dd7。本文の補助色 #4b5260。
角丸 0、構造の枠線 3px、内部区切り 2px、影 4px 4px・ぼかしなし。
13 / 15 / 17 / 21 / 27 / 35px を中心とする文字階層。日本語はシステム sans-serif を使用し、外部フォントの読み込みは不要。

## Layout and components

デスクトップ: 固定位置の左サイドバー、黄色い上部バー、右側のコンテンツ領域。
ホーム: 紹介、四色のショートカット、作品、ノート一覧、活動、GitHub 導線。
ノート一覧、記事、404 も共通テーマ。記事本文は明るい独立面に収める。
800px 以下で上部ナビゲーション、520px 以下で二列ナビゲーションと一列の作品へ切り替える。
既存 MDX、RSS、メタデータ、コードコピーと失敗時の表示を引き継ぐ。

## Interaction

操作対象は原則 44px 以上。ボタンとショートカットは硬い影と押下の移動で反応する。
フォーカスは 3px の紫アウトライン。hover は 150ms。reduced motion では動きと滑らかなスクロールを停止。
装飾的な操作や架空の売上データは追加しない。

## Verification

型チェックと本番静的ビルドは成功。
ローカルの静的ビルドをブラウザーで検証: ホーム・記事は 1440 / 768 / 390 / 320px で横はみ出しなし、axe WCAG A/AA 違反なし。
ノート一覧・テーマ付き 404 は 1440 / 1024 / 810 / 768 / 520 / 390 / 320px で同様に確認。
記事の移動、コードコピー・失敗フィードバック、RSS の全記事リンク、sitemap、robots、404 応答、reduced motion、JavaScript 無効時のコード表示、キーボードのスキップリンクも成功。
デスクトップ・320px のホームをスクリーンショットで目視確認。
ユーザーの追加指示により tanuki へデプロイ。https://daaquan.com でも 1440 / 768 / 390 / 320px の表示・記事移動・axe と、コピー・RSS・404・reduced motion・JavaScript 無効時の検証はすべて成功。
site-build.json のテーマ識別子も neobrutalism-application に更新。
最終リリース 20261009T094025Z。公開 URL でリリース番号、新テーマ識別子、新ホームの反映を確認。
