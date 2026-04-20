---
marp: true
class: invert
paginate: true
---

<style>
  section {
    padding: 4.2rem 3rem 2rem;
  }
  section.lead {
    padding-top: 2rem;
  }
  section:not(.lead) > h2:first-child {
    position: absolute;
    top: 1.4rem;
    left: 3rem;
    right: 3rem;
    margin: 0;
  }
  .mermaid {
    width: 100%;
    height: 100%;
    background: none;
    border: none
  }
  .mermaid svg {
    display: block;
    min-width: 100%;
    max-width: 100%;
    max-height: 100%;
    margin: 0 auto
  }
</style>

<!-- _class: lead invert -->

# コーディングエージェントに *もっと* 喋らせる

バディ・同僚としてのコーディングエージェント #2

---

## おさらい: [前回](https://daikw.github.io/slides/cc/ccpersona/) の発表

- TTS を使ってコーディングエージェントとお話ししようという話
- hook と MCP の違いを説明し、「hook の方が確実」という結論を出した
- [ccpersona](https://github.com/daikw/ccpersona) と hook の設定の紹介

*その後、 ccpersona にいくつかのアップデートを入れました。今日はその紹介。*

---

## おさらい: hook と MCP

|                | hook               | MCP                      |
| -------------- | ------------------ | ------------------------ |
| 実行タイミング | イベント駆動・固定 | エージェントが任意に呼ぶ |
| 確実性         | 高い               | エージェント次第         |
| 柔軟性         | 低い               | 高い                     |
| コンテキスト   | 増やさない         | tool 定義分増える        |

**MCP を使うなら**: エージェントに対して「よく喋る」ように指示を入れないといけない

```md
作業の節目ごとに、 /speak で一言話しかけてください。
```

---

## 人格 = 声 + 文体



今は persona ファイルにまとめて定義する:

```yaml
name: zundamon
voice:
  provider: aivis
  speaker_id: "b7be910e-d703-4b3d-80e4-02d1426d21d0"
  speed: 1.05
  volume: 0.9
prompt: |
  あなたはずんだもんだ。語尾に「なのだ」をつけて話す。
  作業の節目ごとに speak ツールで報告してください。
```

プロジェクトごとに別のペルソナ・別の声を使い分けられる

---

## SessionStart で人格を注入する

SessionStart hook を使って、会話の冒頭にペルソナ本文を差し込む。

```json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [{ "type": "command", "command": "ccpersona hook" }] }
    ]
  }
}
```

**ポイント**: persona ファイルの YAML front matter は除去して渡す

```
name: zundamon    ← これは除去
---
あなたはずんだもんだ...  ← これだけ system prompt に入る
```

最初の一言目からキャラが出る

---

## 起動~発話の流れ

@startuml
!theme plain

participant User
participant "Claude Code" as CC
participant ccpersona
participant AivisSpeech

User -> CC: セッション開始
CC -> ccpersona: SessionStart hook
ccpersona -> CC: ペルソナ本文を stdout に出力\n(system prompt に注入)

loop タスク実行中
  User -> CC: 指示
  CC -> CC: reasoning（ずんだもん口調）
  opt 節目・完了・確認など
    CC -> ccpersona: speak ツール呼び出し (MCP)
    ccpersona -> AivisSpeech: テキスト送信
    AivisSpeech -> User: 音声で話しかける
  end
end

@enduml

---
<!-- _class: lead invert -->

## これは役に立つのか？

# いいえ

---
<!-- _class: lead invert -->

## 役に立つ必要があるんですか？

- ccpersona が、即座に仕事を早く終わらせることはない
- AIエージェントは同僚。自分が気持ちよく働ける同僚を設計すると楽しいかも
- どうせ AI でまともな仕事はなくなる。それまで楽しく働こう

---
<!-- _class: lead invert -->

# おわり

https://github.com/daikw/ccpersona
