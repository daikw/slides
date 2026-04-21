---
marp: true
theme: default
paginate: true
html: true
size: 16:9
style: |
  section {
    font-family: 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', sans-serif;
    font-size: 28px;
    padding: 48px 56px;
    background: #ffffff;
    color: #1f2937;
  }
  h1 {
    color: #0f172a;
    font-size: 42px;
    margin-bottom: 8px;
  }
  h2 {
    color: #0f172a;
    font-size: 32px;
    margin-bottom: 12px;
  }
  h3 {
    color: #0f172a;
    font-size: 24px;
    margin-bottom: 6px;
  }
  p, li {
    line-height: 1.35;
  }
  ul {
    margin-top: 0.2em;
  }
  table {
    font-size: 17px;
    line-height: 1.25;
  }
  code, pre {
    font-size: 17px;
    line-height: 1.3;
  }
  .small {
    font-size: 20px;
  }
  .tiny {
    font-size: 14px;
  }
  .accent {
    color: #0b6bcb;
    font-weight: 700;
  }
  .warn {
    color: #b42318;
    font-weight: 700;
  }
  .good {
    color: #067647;
    font-weight: 700;
  }
  .sources {
    font-size: 12px;
    color: #667085;
    margin-top: 10px;
  }
  .box {
    border: 1px solid #d0d5dd;
    border-radius: 10px;
    padding: 14px 16px;
    background: #f8fafc;
  }
  .cols {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 22px;
  }
  .lead {
    text-align: center;
  }
---

<!-- _class: lead -->

# 古典制御・現代制御・Physical AI の違い

---

## この資料のゴール

- **制御理論の目的**を、数式ではなく役割で理解する
- **古典制御 / 現代制御 / Physical AI** の違いを、
  **表現・設計対象・得意領域**で整理する
- どの課題にどの技術が向いているかの検討がつくようにする

<div class="sources">出典: [3][6]</div>

---

## 制御理論の目的は「望ましい振る舞い」を作ること

```text
目標値 r  →  [ Controller ]  →  [ Plant / Robot ]  →  出力 y
                 ↑                                 │
                 └────────────[ Sensor ]───────────┘
```

- **安定化**: 発散させない、振動しすぎない
- **追従**: 目標値に合わせる
- **外乱抑制**: 負荷変動やノイズに耐える
- **制約対応**: 入力・速度・電流・安全限界の内側で動かす

<div class="small"><span class="accent">ロボットで言えば:</span> 関節・車輪・姿勢・軌道を、狙いどおりに安全に実現すること</div>

<div class="sources">出典: [1][6]</div>

<!--
話すポイント:
- まずは「何のための学問か」を押さえる。
- MITの講義ノートでも classical control の主要目的として disturbance rejection / tracking / noise rejection が整理されている。
-->

---

## 古典制御: 伝達関数と周波数応答で「ループを整える」

- **中心表現**: 伝達関数 `G(s)`、ボード線図、根軌跡
- **典型技術**: **PID**, lead/lag, loop shaping
- **得意**: LTI・SISO に近い系、サーボ、現場での調整
- **強み**: 直感的 / 実装容易 / 高速 / 現場でチューニングしやすい
- **限界**: 多変数・状態制約・複雑な相互作用・大きい非線形に拡張しにくい

<div class="small"><span class="good">重要:</span> 「古典」=「時代遅れ」ではない。<b>いまも産業機器の中核</b>。</div>

<div class="small" style="margin-top: 10px;">PID / ループ整形 / 根軌跡 / 2自由度など、<b>中ジャンル（手法）</b>の地図 → [12]</div>

<div class="sources">出典: [1][2][12]</div>

<!--
話すポイント:
- tf は LTI 系の frequency-domain representation という定義に乗る。
- classical control の value は「よく定義された世界を、安定に、速く、再現性高く回す」こと。
-->

---

## 現代制御: 状態空間で「内部状態ごと設計する」

- **中心表現**: `ẋ = Ax + Bu,  y = Cx + Du`
- **典型技術**: 状態フィードバック、オブザーバ、**LQR/LQG**, **MPC**, H∞
- **得意**: **MIMO**, 状態推定、制約付き最適化、デジタル実装
- **強み**: 系統的 / 拡張しやすい / 設計対象を明示しやすい
- **限界**: モデル品質と線形化に依存しやすい / 知覚や意味理解は別問題

<div class="small"><span class="accent">直感的に言うと:</span> 「出力だけ」ではなく、<b>内部状態を含めて設計する</b>見方。</div>

<div class="small" style="margin-top: 10px;">最適制御 / MPC / ロバスト / 適応など、<b>中ジャンル</b>の一覧 → [12]</div>

<div class="sources">出典: [3][4][5][6][12]</div>

<!--
話すポイント:
- 状態空間表現は MIMO を自然に扱いやすい。
- observer / LQR / MPC に話を繋げやすいので、Physical AI との差分説明にも向く。
-->

---

## 古典制御 vs 現代制御：何が違うのか

<div class="cols">
<div class="box">
<h3>古典制御</h3>
<ul class="small">
  <li><b>変数領域:</b> <b>s 領域</b>（ラプラス・周波数）。微分方程式を手計算しやすい形に持っていく</li>
  <li><b>見る場所:</b> 入出力の<b>周波数応答</b>と<b>ループゲイン</b></li>
  <li><b>表現:</b> 伝達関数 <code>G(s)</code>、ボード線図、根軌跡</li>
  <li><b>設計の型:</b> ゲイン余裕・位相余裕、帯域、PID の位相進み遅れ</li>
  <li><b>独自の強み:</b> <b>安定余裕解析</b>（ギリギリでない安定の度合いを見る）</li>
  <li><b>得意:</b> SISO、現場チューニング、高速な低次サーボ</li>
</ul>
</div>
<div class="box">
<h3>現代制御</h3>
<ul class="small">
  <li><b>変数領域:</b> <b>t 領域</b>（時間上の状態）。人間の直感と相性がよい</li>
  <li><b>見る場所:</b> <b>状態</b>とその時間発展（内部ダイナミクス）</li>
  <li><b>表現:</b> 状態方程式、離散化、MIMO を行列で一括</li>
  <li><b>設計の型:</b> 極配置、LQR のコスト、MPC の制約・予測ホライズン</li>
  <li><b>得意:</b> MIMO、オブザーバ、制約付き最適化の明示</li>
</ul>
</div>
</div>

<div class="small box" style="margin-top: 14px;">
<b>誤解しやすい点:</b> 「古典＝悪・現代＝良」ではない。<b>前提（モデル化できる・ほぼ LTI）が同じでも、設計の言語とスケールが違う</b>。産業では PID が下位、MPC や状態フィードバックが上位、の<b>併用</b>が普通。<br>
<b>名前の由来:</b> 歴史の話で「古典＝手計算で回しやすい枠組みが先に整った側」「現代＝コンピュータ前提で拡張が続く側」とイメージすればよい（良し悪しではない）。
</div>

<div class="sources">出典: [1][2][3][6][10][11]</div>

<!--
話すポイント:
- 違いは「周波数でループを見るか、状態とコストで閉ループを組むか」。
- どちらもモデルに依存するが、現代制御の方が多変数・制約を素直に書ける。
- ここでは Physical AI に入る前に、古典と現代の境界をはっきりさせる。
-->

---

## Physical AI: 学習で「見て・理解して・適応して動く」

- **中心入力**: 画像 / 動画 / 言語 / 音声 / 力覚 / センサ群
- **中心出力**: 高次行動、policy、場合によっては直接 motor action
- **典型技術**: foundation model, **VLM / VLA**, RL, world model, sim-to-real
- **得意**: 未知物体、散らかった環境、指示変更、曖昧な状況
- **限界**: データ依存 / 失敗モードが読みにくい / 安全保証が難しい

<div class="small"><span class="warn">重要:</span> Physical AI は単なる「新しい制御器」ではない。<b>知覚 + 推論 + 行動</b>を含むシステム設計である。</div>

<div class="sources">出典: [7][8][9]</div>

<!--
話すポイント:
- NVIDIA は physical AI を「physical world を perceive, understand, reason, act するAI」と定義している。
- DeepMind の Gemini Robotics は generality / interactivity / dexterity を明示していて、従来制御との差分が説明しやすい。
-->

---

## 3つの違いを一言で言うと

| 観点 | 古典制御 | 現代制御 | Physical AI |
| --- | --- | --- | --- |
| 中心表現 | 伝達関数・周波数応答 | 状態空間・最適化 | 学習済み policy / VLA / world model |
| 世界の前提 | よく定義・比較的一定 | モデル化可能・多変数 | 未知・変動・曖昧 |
| 得意 | 安定化・追従 | MIMO・推定・制約 | 知覚・言語指示・汎化 |
| 典型技術 | PID, root locus | state feedback, observer, MPC | VLM/VLA, RL, sim-to-real |
| 主な弱点 | 複雑系で拡張しにくい | モデル依存 | 安全保証・データ依存 |

<div class="small"><span class="accent">要点:</span> 違いは「賢さの上下」ではなく、<b>どんな世界を相手にしているか</b>にある。</div>

<div class="sources">出典: [1][2][3][6][7][9][11]</div>

<!--
話すポイント:
- ここは資料の山場。分類は「対象世界の不確実さ」で整理すると伝わる。
- 古典/現代を lower layer、Physical AI を upper layer と見ると誤解が少ない。
-->

---

## 制御工学 vs AI：強みの比較

多くの整理では、**古典・現代をひっくるめた「制御工学」**と、**データ駆動の AI 制御**を並べて考える（根底の目的はどちらも「対象を操る」）。

| 比較項目 | 制御工学（代表） | AI 制御（代表） |
| --- | --- | --- |
| メインの守備 | **モデルベースド** | **モデルフリー**（データから） |
| 性能の突き詰め | 理論上たどりやすい | 突き詰めにくいことが多い |
| 分析・原因追及 | しやすい | しにくい（ブラックボックス） |
| 信頼性・保証 | 設計しやすい | **分布外は難所** |
| 適用 | モデル化できるもの | **数式にしにくい目的・対象**にも伸びる |

<div class="small box" style="margin-top: 8px;">
<b>ざっくり:</b> 数式モデルが律儀に立つなら制御工学が強い。「意味」「汎化」「曖昧な指示」など<b>モデルに落としにくい球</b>は AI 側が強い → 次スライドの<b>階層分業</b>で合体させる。
</div>

<div class="sources">出典: [13]</div>

<!--
話すポイント:
- controlabo は「学会ではどちらも制御の一ジャンル」と書いている。入口資料では階層の話に繋げるのが実務的。
-->

---

## 実務では「置き換え」ではなく「階層分業」

```text
タスク理解 / 自然言語指示 / 高次計画         ← Physical AI
↓
知覚 / 意味理解 / policy 選択                ← Physical AI
↓
軌道生成 / 状態推定 / MPC / state feedback   ← 現代制御
↓
サーボ / PID / 電流制御 / 安定化             ← 古典制御
```

- **下位ほど**: 高速・決定的・安全クリティカル
- **上位ほど**: 曖昧さ対応・タスク理解・環境適応
- Google DeepMind も、**Gemini Robotics-ER を既存の low-level controllers に接続**する前提を示している

<div class="small" style="margin-top: 8px;">階層での使い分け・組み合わせの考え方の詳細 → [13]</div>

<div class="sources">出典: [9][13]</div>

<!--
話すポイント:
- 「AIが全部を置き換える」という誤解をここで潰す。
- 実際のロボットは lower layer の安定制御なしでは成立しない。
-->

---

## 具体例

<div class="cols">
<div class="box">
<b>固定セルのピック&プレース</b>
<ul>
  <li>位置・対象・手順がほぼ固定</li>
  <li>高速・高再現性・低レイテンシが重要</li>
  <li><b>主役:</b> <span class="good">古典制御 + 現代制御</span></li>
</ul>
</div>
<div class="box">
<b>散らかった環境での家庭内片付け</b>
<ul>
  <li>物体・向き・遮蔽・指示が毎回違う</li>
  <li>知覚・言語理解・汎化が必要</li>
  <li><b>主役:</b> <span class="accent">Physical AI + 下位制御</span></li>
</ul>
</div>
</div>

<!--
話すポイント:
- 新入社員にはこの2例でほぼ伝わる。
- 産業ロボット vs 家庭内ロボットの対比は、なぜ Physical AI が必要かを直感で理解させやすい。
-->

---

## この資料の結論

- **制御理論の目的**は、安定・追従・外乱抑制・制約対応を実現すること
- **古典制御**は、よく定義された世界でループを整える技術
- **現代制御**は、内部状態と制約を明示して系統的に設計する技術
- **Physical AI**は、定義しきれない現実世界に対して、知覚・意味理解・適応を足す技術
- したがって、**Physical AI は制御理論の代替ではなく、上位拡張**と捉えるのが実務的

<div class="box small">
<b>新規事業の観点:</b><br>
狙い目は、<b>人が状況判断していた部分</b>を機械に移せるかどうか。ただし、最終的な安全・安定は依然として制御理論が支える。
</div>

<div class="sources">出典: [1][6][7][9][11][13]</div>

<!--
話すポイント:
- 事業ワークに繋げるなら「どのレイヤの課題を解くか」で整理する。
- Physical AI はロボット本体だけでなく、データ、評価、監視、安全にも事業機会がある。
-->

---

## モデルベースド vs モデルフリー

- **モデルベースド制御:** 対象を**数式モデル**で表し、それに基づき制御器を設計する（本資料の**古典・現代の主戦場**）
- **モデルフリー制御:** **明示モデルを設計の前提にしない**。「どう動いたか」のデータ等から制御器を得る（policy 学習など）
- **Physical AI:** 多くの場合**モデルフリー側が厚い**。一方で、学習でモデルや残差を推定して **MPC 等のモデルベースドに渡す**のも一般的

**モデルベースドの中の二柱（対比の軸）**

| 項目 | **古典制御** | **現代制御** |
| --- | --- | --- |
| 変数の見方 | **s 領域**（周波数） | **t 領域**（時間・状態） |
| 表現 | 伝達関数 | 状態方程式 |
| 入出力 | SISO が主 | MIMO も扱いやすい |

<div class="small box" style="margin-top: 10px;">
<b>注意:</b> ジャンルの境界は曖昧で、ここでは多くの現場感覚に近い整理として <b>controlabo「制御図鑑」</b>の切り方に寄せている。
</div>

<div class="sources">出典: [10][11]</div>

---

## 参考資料

<div class="tiny">

**[1] MIT OpenCourseWare — 6.241J Dynamic Systems and Control, Chapter 18: Performance of Feedback Systems**  
https://ocw.mit.edu/courses/6-241j-dynamic-systems-and-control-spring-2011/ffd08addc36bc0fd02586dd7624d9031_MIT6_241JS11_chap18.pdf

**[2] MathWorks — `tf` (Transfer Function Model)**  
https://www.mathworks.com/help/control/ref/tf.html

**[3] MIT OpenCourseWare — 16.30 Feedback Control Systems, Topic 5: Introduction to State-Space Models**  
https://ocw.mit.edu/courses/16-30-feedback-control-systems-fall-2010/1bfc976fcead1982d90c5057511e5ef7_MIT16_30F10_lec05.pdf

**[4] MathWorks — Linear (LTI) Models**  
https://www.mathworks.com/help/control/getstart/linear-lti-models.html

**[5] University of Michigan CTMS — State-Space Methods for Controller Design**  
https://ctms.engin.umich.edu/CTMS/index.php?example=Introduction&section=ControlStateSpace

**[6] MathWorks — What Is Optimal Control?**  
https://www.mathworks.com/discovery/optimal-control.html

**[7] NVIDIA Glossary — What is Physical AI?**  
https://www.nvidia.com/en-us/glossary/generative-physical-ai/

**[8] NVIDIA Blog — What Is NVIDIA's Three-Computer Solution for Robotics?**  
https://blogs.nvidia.com/blog/three-computers-robotics/

**[9] Google DeepMind — Gemini Robotics brings AI into the physical world**  
https://deepmind.google/blog/gemini-robotics-brings-ai-into-the-physical-world/

**[10] controlabo — 古典制御・現代制御とは？それぞれの違いと利点を比較！**  
https://controlabo.com/classic-modern/

**[11] controlabo — 【制御図鑑】制御の主要ジャンル14種類。これが制御の全体像だ！**  
https://controlabo.com/control-categories/

**[12] controlabo — 【制御図鑑Ⅱ】古典制御・現代制御の主な手法15種類のまとめ**  
https://controlabo.com/control-types/

**[13] controlabo — 制御工学とAI分野の関係。強みを比較すれば役割分担は明らか！**  
https://controlabo.com/control-engineering-vs-ai/

</div>

<!--
話すポイント:
- 時間がなければ [1][3][9] の3本だけで十分。
- より実務寄りに見るなら [6][7][9] を先に読むと理解が早い。
- 制御の全体像・古典/現代の対比・AI との役割分担は [11][10][13]、手法の樹状図は [12]。
-->
