---
name: marp
description: Marp スライドに関するスキル。「Marp スライドを作って」「新しいスライドを追加したい」「Marp の使い方を教えて」などのリクエストで使用。
---

# Marp

## When to Use

- 新しい Marp スライドを作成したいとき
- スライドのテンプレートを知りたいとき
- Marp の使い方を知りたいとき

## リポジトリ構成

```
~/ghq/github.com/daikw/slides/
├── src/                   # スライドソース（ここに追加する）
│   └── xxx/                # xxxカテゴリ
│       └── yyy/            # yyyスライド
│           └── SLIDE.md
│           └── files/
│               └── image.png
└── scripts/
    └── build-marp.mjs     # ビルドスクリプト
```

## スライド作成フロー

1. **AskUserQuestion でヒアリング**
2. **ディレクトリ作成**
3. **SLIDE.md を作成**（`./template.md` を参照）
4. **ビルド**: `npm run build` を実行すると `site/` に HTML スライドが生成される

## Marp 記法

使い方を知りたいときは以下を参照する

- https://github.com/marp-team/marp/tree/main/website/docs/guide
- https://zenn.dev/yhatt/scraps/d6004a2455e573

## 画像の使い方

```markdown
<!-- ローカル画像 -->
![alt text](../../files/image.png)

<!-- サイズ指定 -->
![w:500px](../../files/image.png)

<!-- 背景画像 -->
![bg right:40%](../../files/image.png)
```

## 注意事項

- ファイル名は必ず `SLIDE.md`（大文字）
- `src/` 以下の `SLIDE.md` がビルド対象として自動検出される
