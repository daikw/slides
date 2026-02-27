# Architecture

## ビルドプロセス

`scripts/build-marp.mjs` がコアのビルドスクリプト:
1. `src/` 配下から `marp: true` フロントマターを持つ Markdown を探索
2. Marp CLI で HTML に変換 → `site/<path>/index.html`
3. OGP 画像（ogp.png）を各スライドから生成
4. Git 履歴から作成日を取得し、タイトルスライドに表示
5. ローカル画像・アセットを自動コピー
6. インデックスページ `site/index.html` を生成

## ディレクトリ構造

- `src/` - スライドソース。サブディレクトリ構造がそのまま URL パスになる
- `site/` - 生成されたサイト（.gitignore）
- `.marprc.cjs` - Marp 設定（PlantUML プラグイン有効化）

## CI/CD

`main` ブランチへの push で GitHub Actions が `npm run build` → GitHub Pages にデプロイ。
