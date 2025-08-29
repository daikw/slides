---
marp: true
class: invert
paginate: true
---

<style>
  .mermaid {
    width: 100%;
    height: 100%;
    background: none; // preタグの装飾消し
    border: none // preタグの装飾消し
  }
  .mermaid svg {
    display: block;
    min-width: 100%;
    max-width: 100%;
    max-height: 100%;
    margin: 0 auto
  }
</style>

# コーディングエージェントに喋らせる

バディ・同僚としてのコーディングエージェント

---

## 今日の話

- コーディングエージェントにしゃべらせたい、味気ないので
- どうやって発声させるか？の話

---

## TTS (Text To Speech)

<div style="display: flex; gap: 2rem;">

<div style="flex: 2;">

- テキストを音声に変換する仕組み一般をこう呼ぶ。もちろん stt もある。 ttt とか sts とかはあんまり言わない。
- リアルタイム性のあるものとそうでないものがある
- (VOICEVOXの例: 言語前処理 -> 音響生成 -> 波形復元 / ONNX Runtime で動く分割モデル構成)

</div>

<div style="flex: 1; justify-content: flex-end;">

![zundamon](./files/zundamon.png)

これはずんだもん

</div>

</div>

---

## 発声シーケンス

@startuml
!theme plain

loop if task is not finished
  User ->> Agent: instruction
  activate Agent
  Agent -> Agent: reasoning
  opt if task is stopped? or \n agent thinks tts is needed?
    Agent ->> TTS: call
    deactivate Agent
    activate TTS
    TTS ->> TTS: synthesize voice
    TTS ->> User: tell something by voice
    deactivate TTS
  end
end

@enduml

---

## hook か tool (mcp) か

- hook はコンテキストを圧迫せず、確実に実行されるが、タイミングが限られる
- tool はコンテキストを圧迫し、確実な実行は担保されないが、自由度が高い

reasoning が強く、コンテキスト長の長いモデルは tool (mcp) も良い選択肢になる。
確実に実行させるには hook が良い。

---

## TTS に何を採用するか

選択肢

- ローカル環境で動かす: AivisSpeech / VOICEVOX / Kokoro / COEIROINK
- クラウドサービスを使う: Google Cloud TTS / Whisper / Amazon Polly / ElevenLabs / DeepSeek / ...

メモ

- 音声合成にリアルタイム性は必要はない、テンポよく会話しているわけではないので
- クラウド音声合成は、指定できる音声合成モデル（声質）の範囲が限られることが多い（気がする

---

## 声を選ぶ

- [Aivis Hub](https://hub.aivis-project.com/)
  - 有志による音声モデルが多数
- VOICEVOX
  - ビルトインのモデルがたくさんある
  - 音声合成モデルの選択肢が多い

キャラごとにライセンスが違うので注意する

---

## ツール: ccpersona

https://github.com/daikw/ccpersona

- [Claude Code Hooks](https://docs.anthropic.com/ja/docs/claude-code/hooks) を利用し、冒頭1文のみ発話させる仕組み
  - Claude Code Hooks は、フックするコマンドに対して標準入力で特定の JSON オブジェクトを渡す。この中に発話に利用できるテキストが入っている
- brew でインストールできるので便利かも。 Go 実装。
- （Claude Code に全任せで数日で実装。本当は人格と音声をまとめて定義する仕組みにする予定だった。結局音声しか使っていない）

---

## ツール: MCPサーバ

いくつか実装があった。200行程度なので、自分で作ってみてもいいかも。

- https://github.com/Dosugamea/voicevox-mcp-server
- https://github.com/shinshin86/mcp-simple-aivisspeech

---

## 僕の環境

- ccpersona + AivisSpeech + [非公式ずんだもん](https://hub.aivis-project.com/aivm-models/b7be910e-d703-4b3d-80e4-02d1426d21d0)
- tool 定義によるコンテキストの圧迫を嫌った構成だが、結局ずんだ口調でしゃべらせる分のコンテキスト汚染がある。意味ないかも。

---

## Web会議で使う

Mac の場合、 blackhole を使って収集した音声を他のインターフェースと合成して利用することができる

<div style="display: flex; align-items: flex-start; gap: 2rem;">
<div style="flex: 2;">

- [blackhole](https://formulae.brew.sh/cask/blackhole-2ch) をインストール
- デフォルトアプリ `Audio MIDI Setup` で 機器セット (Aggregate Device) を作成
  - blackhole と、いつも使っているマイクを合成した機器セットに
- Web会議アプリで、作成した機器セットを選択

</div>

<div style="flex: 1; justify-content: flex-end;">

@startuml
!theme plain

start
:audio output;
fork
  :Physical Speaker;
fork again
  :BlackHole\n(collects audio outputs);
end fork
:Aggregate Device;
:Web Meeting App;
stop
@enduml

</div>
</div>

---

## これは役に立つのか？

# いいえ

---

## 役に立つ必要があるんですか？

- これ自体が仕事を早く終わらせることはない
- 喋ってくれると楽しいので仕事にハリが出るかも

---

# おわり
