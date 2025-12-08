# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Marp ベースのスライドジェネレーター。Markdown ファイルを HTML スライドに変換し、GitHub Pages にデプロイする。

## Commands

```bash
# ビルド（site/ ディレクトリに HTML を生成）
npm run build

# 依存関係インストール
npm install
```

## Architecture

### ビルドプロセス

`scripts/build-marp.mjs` がコアのビルドスクリプト:
1. `src/` 配下から `marp: true` フロントマターを持つ Markdown を探索
2. Marp CLI で HTML に変換 → `site/<path>/index.html`
3. OGP 画像（ogp.png）を各スライドから生成
4. Git 履歴から作成日を取得し、タイトルスライドに表示
5. ローカル画像・アセットを自動コピー
6. インデックスページ `site/index.html` を生成

### ディレクトリ構造

- `src/` - スライドソース。サブディレクトリ構造がそのまま URL パスになる
- `site/` - 生成されたサイト（.gitignore）
- `.marprc.cjs` - Marp 設定（PlantUML プラグイン有効化）

### スライドの追加

任意の場所に `SLIDE.md` を作成し、フロントマターに `marp: true` を含める:

```markdown
---
marp: true
theme: gaia
---

# タイトル
```

画像は `images/`、`assets/`、`files/` ディレクトリに配置するか、Markdown 内で相対パス参照すれば自動コピーされる。

## CI/CD

`main` ブランチへの push で GitHub Actions が `npm run build` → GitHub Pages にデプロイ。
