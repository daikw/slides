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

## ゴール

- 制御理論の目的を押さえる
- 古典制御 / 現代制御 / Physical AI を、**対象世界** と **工学パラダイム** の 2 軸で整理
- どの課題にどの技術が向くか、見当がつく状態にする

---

## 制御理論の目的

```text
目標値 r  →  [ Controller ]  →  [ Plant / Robot ]  →  出力 y
                 ↑                                 │
                 └────────────[ Sensor ]───────────┘
```

- **安定化**: 発散させず、過度に振動させない
- **追従**: 目標値どおりに動かす
- **外乱抑制**: 負荷変動やノイズに耐える
- **制約対応**: 入力・速度・電流・安全限界の範囲内に収める

<div class="small box" style="margin-top: 14px;">
<div class="small"><span class="accent">ロボットで言えば:</span> 関節・車輪・姿勢・軌道を、狙いどおりに、かつ安全に動かすこと</div>
</div>

<!--
話すポイント:
- まずは「何のための学問か」を押さえる。
- MITの講義ノートでも classical control の主要目的として disturbance rejection / tracking / noise rejection が整理されている。
-->

---

## 古典制御

- **主な表現**: 伝達関数 `G(s)`、ボード線図、根軌跡
- **典型技術**: **PID**, lead/lag, loop shaping
- **得意**: LTI・SISO に近い系、サーボ、実装現場でのチューニング
- **強み**: 直感的・実装が容易・高速・実機で調整しやすい
- **限界**: 多変数・状態制約・複雑な相互作用・強い非線形への拡張が難しい

<div class="small box" style="margin-top: 14px;">
<b>いまも産業機器の中核</b>。「古典」≠「時代遅れ」。
</div>

<!--
話すポイント:
- tf は LTI 系の frequency-domain representation という定義に乗る。
- classical control の value は「よく定義された世界を、安定に、速く、再現性高く回す」こと。
-->

---

## 現代制御

- **主な表現**: `ẋ = Ax + Bu,  y = Cx + Du`
- **典型技術**: 状態フィードバック、オブザーバ、**LQR/LQG**, **MPC**, H∞
- **得意**: **MIMO**, 状態推定、制約を明示した最適化、デジタル実装
- **強み**: 系統的・拡張しやすい・設計対象を明示しやすい
- **限界**: モデル品質と線形化への依存が強い・知覚や意味理解は対象外

<div class="small box" style="margin-top: 14px;">
「出力だけ」ではなく、<b>内部状態を含めて設計する</b>見方。
</div>

<!--
話すポイント:
- 状態空間表現は MIMO を自然に扱いやすい。
- observer / LQR / MPC に話を繋げやすいので、Physical AI との差分説明にも向く。
-->

---

## 制御設計の 6 フェーズ

古典制御・現代制御ともに **6 フェーズは共通**。道具が変わるだけ。

| # | フェーズ | 目的 | 主な道具 |
|---|---------|------|---------|
| 1 | **要求定義** | 立上り・整定・定常偏差・オーバーシュート・制約・安全要件を数値化 | 仕様書、試験条件、FMEA |
| 2 | **モデリング** | 設計できる近似モデルを作る | 物理モデル、**System Identification**、線形化、離散化 (`c2d`) |
| 3 | **設計可能性の確認** | そのモデルで本当に制御できるか | 古典: ボード線図、根軌跡、ゲイン/位相余裕 ／ 現代: 可制御性・可観測性 |
| 4 | **コントローラ合成** | 構造とパラメータを決める | 古典: **PID**, 位相進み・遅れ補償, loop shaping ／ 現代: 極配置, **LQR/LQG**, **MPC** |
| 5 | **検証** | モデル誤差込みで壊れないか確認 | シミュレーション、残差解析、外乱・ノイズ・遅延・飽和・量子化の考慮 |
| 6 | **実装 / HIL / 現場調整** | 実機化して運用域に載せる | **SIL/PIL/HIL**、自動コード生成、ゲインスケジューリング、再同定 |

<div class="small box" style="margin-top: 10px;">
古典/現代が分かれるのは <b>モデリング (#2) と合成 (#4) のみ</b>。他のフェーズは共通。
</div>

<!--
話すポイント:
- 「6フェーズ」は MathWorks / CTMS の教科書的分類にほぼ対応。どこで古典/現代が分かれるかは #2 と #4 のみ、と伝えると覚えやすい。
- 新入社員には「コントローラを書くだけが設計ではない。モデル作りと検証と実装の方が時間を食う」と明言しておく。
-->

---

## 分岐点と実装の落とし穴

<div class="cols">
<div class="box">
<b>フェーズ別の分岐点</b>
<ul class="small">
  <li><b>モデリング:</b> 古典=入出力視点 (伝達関数) ／ 現代=内部状態視点 (状態空間)</li>
  <li><b>設計可能性:</b> 古典=ゲイン/位相余裕 ／ 現代=可制御性・可観測性</li>
  <li><b>合成:</b> 古典=経験則的チューニング (PID tuning) ／ 現代=最適化 (LQR のコスト、MPC の制約)</li>
  <li><b>推定:</b> 古典=使わないことが多い ／ 現代=<b>オブザーバ (Kalman)</b> で内部状態を推定</li>
  <li><b>向くケース:</b> 古典=SISO・低次・速い ／ 現代=MIMO・制約あり・推定要</li>
  <li><b>現場では併用:</b> PID を下位、MPC や状態 FB を上位に組むのが普通</li>
</ul>
</div>
<div class="box">
<b>「モデルは合っていたのに実機で壊れる」落とし穴</b>
<ul class="small">
  <li><b>遅延:</b> センサ・通信・計算時間が仕様より長く、位相余裕を食う</li>
  <li><b>飽和 &amp; アンチワインドアップ不備:</b> アクチュエータ飽和中に PID の積分項が暴走</li>
  <li><b>量子化・固定小数点:</b> 丸め誤差が長周期で蓄積</li>
  <li><b>離散化誤差:</b> サンプル周期が粗い ／ Tustin/ZOH の選択</li>
  <li><b>ノイズ・温度ドリフト:</b> モデル乖離の最大要因</li>
</ul>
</div>
</div>

<div class="small box" style="margin-top: 12px;">
現場では <b>HIL (Hardware-in-the-Loop)</b> で罠を潰してから実機投入する。「動くコントローラ」と「壊れないコントローラ」は別物。Physical AI の下層も、この制御理論が支える。
</div>

<!--
話すポイント:
- 古典/現代の分岐はいくつかあるが、覚えるべきは「モデリング視点」「設計可能性の指標」「合成方法」「推定の要否」の4つ。
- 落とし穴は実機をやらないと気づきにくい。HIL は「実機の一歩手前で問題を顕在化させる」ための工程。
- これを押さえてから Physical AI の話に入ると、「下層制御の責務が消えない」理由が腹落ちする。
-->

---

# Physical AI

---

## Physical AI とは

<div class="cols">
<div class="box">
<b>定義 (一次情報ベース)</b>
<ul class="small">
  <li><b>NVIDIA:</b> 現実世界に具現化された AI。<b>世界モデル・合成データ・物理シム</b>が中核 [7][14]</li>
  <li><b>DeepMind:</b> <b>embodied reasoning</b> 軸。<code>Gemini Robotics (VLA)</code> と <code>Gemini Robotics-ER (空間推論)</code> を分離 [9][15]</li>
  <li><b>学術:</b> Embodied AI が上位概念、Robot Foundation Model / VLA はその下位</li>
</ul>
</div>
<div class="box">
<b>「System 2 / System 1」で見るスタック</b>
<ul class="small">
  <li><b>System 2 (遅い・賢い):</b> VLM / ER — タスク理解・空間推論・計画</li>
  <li><b>System 1 (速い・反射的):</b> <b>VLA</b> — 知覚から行動への直結</li>
  <li><b>下層 (kHz 帯):</b> 古典/現代制御 — 安定化・接触・拘束・安全 (例: Figure の <code>kHz torque control</code>) [17]</li>
</ul>
</div>
</div>

<div class="small box" style="margin-top: 14px;">
Physical AI は単一モデルではなく、<b>「VLM/ER + VLA + world model/sim/data factory」の階層スタック</b>。知覚・推論・行動・学習データ循環を閉じる、上位システム設計である。
</div>

<!--
話すポイント:
- NVIDIA の "Physical AI" と DeepMind の "embodied reasoning" はほぼ同じものを別角度から言っている。System 2/1 の整理は Figure Helix / NVIDIA GR00T で採用されている共通言語。
- 下層の高速制御は消えない。DeepMind も "Gemini Robotics-ER を既存 low-level controllers に接続" と明言している [15]。
-->

---

## Physical AI の現在地 (2025-2026)

<div class="cols">
<div class="box">
<b>代表モデル (VLA / システム)</b>
<ul class="small">
  <li><b>Gemini Robotics / ER</b> (Google DeepMind) — VLA + 空間推論, 安全評価 ASIMOV [9][15]</li>
  <li><b>Figure Helix</b> — System 2/1 構成, kHz トルク制御 [16][17]</li>
  <li><b>π0</b> (Physical Intelligence) — 汎用 VLA [18]</li>
  <li><b>NVIDIA Isaac GR00T N1</b> — オープン humanoid foundation model [19]</li>
  <li><b>OpenVLA / SmolVLA</b> — オープン系・軽量系</li>
</ul>
</div>
<div class="box">
<b>スケール要因 (=競争ボトルネック)</b>
<ul class="small">
  <li><b>world model:</b> NVIDIA Cosmos, Omniverse [14]</li>
  <li><b>合成データ / sim-to-real:</b> Isaac Sim</li>
  <li><b>teleop / human demo:</b> Mobile ALOHA, LeRobot</li>
  <li><b>RL:</b> 歩行・低層スキル・post-training に残る</li>
</ul>
</div>
</div>

<div class="small box" style="margin-top: 12px;">
<b>未解決課題:</b> 安全保証・失敗モードの把握・データ不足・評価コスト・低遅延<br>
<b>事業機会は基盤モデル本体より下流</b>: データ・評価/安全監視・実機統合・業務特化 post-train
</div>

<!--
話すポイント:
- VLA は「実行中枢」、VLM/ER は「上位推論」、world model/sim/data は「スケール要因」の三層で覚えてもらう。
- 事業視点では、モデルの賢さより、データ・評価・安全・実機統合のレイヤに勝負どころが移っている。
-->

---

## モデル開発の 4 段階

「LLM の世界知識」→「人のお手本で真似る」→「現場用に微調整」→「最後の詰めで RL」。**現行の主戦力は Stage 2-3**、Stage 4 は限定導入。

| Stage | やること | 代表事例 (2024-2026) | 主な担い手 |
|-------|---------|--------------------|-----------|
| **1. 事前学習** | Web/動画規模の **VLM/LLM** を基盤に、ロボット行動データと接続 | **RT-2** (VLM を視覚言語タスクとロボット軌跡で co-fine-tune) [20] / Gemini Robotics (Gemini 2.0 ベース) [9] / GR00T N1 (egocentric human video + sim/synthetic) [19] | 基盤モデルベンダ |
| **2. 模倣学習 (BC)** | **teleop / human demo** で「見て動きを真似る」Behavior Cloning | **Mobile ALOHA** (whole-body teleop + BC) [21] / OpenVLA (970k real demos) [22] / Helix (~500h teleop を自動ラベル化) [16] | ベンダ + アプリ |
| **3. 分野特化 post-training (SFT)** | ドメイン・タスク専用に fine-tuning | π0 / openpi は fine-tuning 前提で OSS [18] / LeRobot が学習道具を提供 [23] / Gemini Robotics-ER は low-level controller 接続 [15] | アプリ / ロボット事業者 |
| **4. 強化学習 (RL)** | 最後の信頼性改善 (偏りや失敗を詰める) | π*0.6 (offline RL + autonomous episodes + human corrections) [25] / Figure の歩行 (RL + sim-to-real + kHz torque) [17] | 高 ROI 案件のみ |

<div class="small box" style="margin-top: 10px;">
<b>制御設計フローとの対比 (比喩):</b> Stage 1 ≈「広い事前知識」／ Stage 2-3 ≈「名目設計 (合成フェーズ)」／ Stage 4 ≈「現場再調整 (gain scheduling)」。制御は<b>保証</b>、VLA は<b>データ駆動の汎化</b>と、根本思想は違う。
</div>

<!--
話すポイント:
- 「事前学習 → 模倣 → SFT → RL」の順は LLM の RLHF と似ているが、データ源と責務分界が違う。
- Stage 1 は基盤モデルベンダ、Stage 2-3 はアプリ側、Stage 4 は高 ROI 案件だけ。事業機会の分布もこの分界で決まる。
-->

---

# 比較

---

## 登場人物マップ

登場人物は **「対象世界」×「工学パラダイム」** の 2 軸で一意に配置できる。

|  | **テキスト / 意味空間** | **物理 / 実世界** |
| --- | --- | --- |
| **モデルベース**<br>(明示モデルで保証) | — | **制御工学**<br>古典・現代 (PID, LQR, MPC) |
| **データ駆動**<br>(データから学ぶ) | **LLM**<br>GPT, Claude, Gemini | **Physical AI**<br>VLA, world model, RL |

<div class="small box" style="margin-top: 12px;">
LLM と Physical AI は並列の競合ではなく <b>隣のマス目</b> (縦=同じデータ駆動、横=テキスト/物理)。VLA = VLM + Action なので一部重なる。
</div>

<!--
話すポイント:
- 登場人物は全部で 4 種類。2×2 のマトリクスで一意に配置できる。
- LLM と Physical AI は "並列の競合技術" ではなく、"隣のマス目で一部重なる" 関係。
- この後の比較表は、このマトリクスの横軸 / 縦軸 のどちらで見るかを切り替えるだけ、と予告しておくと読者が迷わない。
-->

---

## 横軸: 対象世界の複雑さ

古典 → 現代 → Physical AI の順に、**扱える世界の曖昧さが広がる** (LLM は対象世界がテキストなのでここには出ない)。

| 観点 | 古典制御 | 現代制御 | Physical AI |
| --- | --- | --- | --- |
| **世界の前提** | よく定義・比較的一定 | モデル化可能・多変数 | **未知・変動・曖昧** |
| 主な表現 | 伝達関数・周波数応答 | 状態空間・最適化 | VLA + VLM/ER + world model (階層スタック) |
| 得意 | 安定化・追従 | MIMO・推定・制約 | 知覚・言語指示・汎化 |
| 典型技術 | PID, root locus | state feedback, observer, MPC | VLA, VLM/ER, world model, sim-to-real, 模倣学習/RL |
| 主な弱点 | 複雑系で拡張しにくい | モデル依存 | 安全保証・失敗モード把握・データ/評価コスト |

<div class="small" style="margin-top: 10px;">違いは「賢さの上下」ではなく、<b>どんな世界を相手にしているか</b>。</div>

<!--
話すポイント:
- ここは資料の山場。分類は「対象世界の不確実さ」で整理すると伝わる。
- 古典/現代を lower layer、Physical AI を upper layer と見ると誤解が少ない。
- LLM がここに出てこないのは「対象世界がテキストで、横軸の話ではない」から。次スライドで登場させる、と予告しておく。
-->

---

## 縦軸: 工学パラダイム × 運用サイクル

古典・現代を「制御工学 = モデルベースド」、データ駆動 AI を LLM と Physical AI に分解する。

| 比較項目 | 制御工学 | LLM (テキスト AI) | Physical AI (実世界 AI) |
| --- | --- | --- | --- |
| 中心 | **モデルベースド** | データ駆動 (言語) | データ駆動 (行動) |
| 性能の追い込み | 理論的に追いやすい | ベンチで測れるが上限見えにくい | 追いにくい (評価コスト大) |
| 分析・原因追及 | しやすい | しにくい (ブラックボックス) | しにくい ＋ 物理作用あり |
| 信頼性・保証 | 設計しやすい | 幻覚・カットオフが残課題 | **分布外 + 物理リスク** |
| 適用範囲 | モデル化できる対象 | 言語・コード・推論 | 実世界タスク (操作・移動) |
| **再学習サイクル** | ゲインスケジューリング / 再同定 | 世代交代 (バッチ) + RAG / memory | バッチ再学習 + ロボット calibration |
| **推論中の適応** | — | in-context / RAG / memory | in-context + 実機キャリブレーション |
| **物理リスク** | 設計保証が中心 | 低 (テキスト出力のみ) | <span class="warn">高 (人・機器・環境への物理作用)</span> |

<div class="small box" style="margin-top: 8px;">
数式モデルが綺麗に書けるなら制御工学が強い。「意味・汎化・曖昧な指示」は LLM/Physical AI 側が強い。<b>実世界で動かすときは Physical AI + 下層制御の組み合わせ</b>が不可欠。
</div>

<!--
話すポイント:
- LLM と Physical AI は同じ "データ駆動 AI" でも、物理リスク・推論中の適応手段・再学習サイクルがかなり違う。
- 常時オンライン学習はどの AI も研究段階で、バッチ再学習 + RAG/memory で補うのが現実解 (詳細は Appendix)。
-->

---

## 階層ごとの役割分担

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
- Google DeepMind も、**Gemini Robotics-ER を既存 low-level controllers に接続**する前提を示している [15]

<div class="small" style="margin-top: 8px;">階層の使い分けの詳細 → [13]</div>

<!--
話すポイント:
- 「AIが全部を置き換える」という誤解をここで潰す。
- 実際のロボットは lower layer の安定制御なしでは成立しない。
-->

---

## アーキテクチャと規模感: PID / LQR / π0

<div class="small">

**古典制御 (PID)** — 3 パラメータ / 数 KB / kHz 制御

```text
e(t) → Kp·e + Ki·∫e + Kd·ė → u(t)
        ↑__ 積分項 (1D) __↑
```

**現代制御 (LQR + オブザーバ / MPC)** — ~10²-10⁴ パラメータ / 数 MB / 100Hz-kHz

```text
y ∈ ℝⁿ → オブザーバ x̂ ∈ ℝⁿ → u = -K x̂ → u ∈ ℝᵐ
         (MPC: u(·) = argmin Σ‖x‖²+‖u‖² s.t. 制約)
```

**π0 (汎用 VLA, Physical Intelligence)** — 3.3B params / ~6 GB BF16 / 0.5-0.8s 毎に再推論 [18]

```text
RGB×2-3 + proprio + 言語 prompt
   ↓
PaliGemma 3B (backbone)  →  action expert 300M (flow matching, 10 steps)
                                       ↓
                            action chunk (H=50 steps × 7-19D)
```

</div>

| 観点 | 古典制御 (PID) | 現代制御 (LQR/MPC) | π0 (汎用 VLA) |
| --- | --- | --- | --- |
| **パラメータ数** | **~3** | **~10²-10⁴** | **~3.3 × 10⁹** |
| **メモリ** | **数 KB** | **数 MB** | **数 GB** |
| 入力 | スカラー誤差 | 状態/出力ベクトル | 画像 + proprio + 言語 |
| 出力 | スカラー u(t) | u ∈ ℝᵐ | action chunk H=50 |
| 演算 | 線形和 | 行列 / 凸最適化 | Transformer + flow |
| 推論周期 | kHz | 100Hz-kHz | chunk: ~1-2 Hz / 制御: 20-50 Hz |

<div class="small box" style="margin-top: 8px;">
スケールが <b>10⁰ → 10⁴ → 10⁹</b> と桁違い。古典/現代は「数式モデルから演算式を導く」、π0 は「お手本を圧縮した重み」。実機では <b>π0 (chunk 生成) + 下層制御 (高速安定化)</b> の併用が現実解。
</div>

<!--
話すポイント:
- 規模差が 6-9 桁なのを見せると Physical AI が「重い」理由が腹落ちする。
- π0 は PaliGemma 3B + 300M flow head。chunk 単位の推論 (0.5-0.8s) と、chunk 内の高頻度制御 (20-50Hz) の二段構え。
- π0-FAST は autoregressive (FAST トークナイザ) で同じ 3B 級。π0.5 は階層 (高レベル subtask 生成 → 低レベル flow) で 50Hz 制御。
- 出典: https://www.pi.website/download/pi0.pdf, https://arxiv.org/pdf/2501.09747, https://www.pi.website/download/pi05.pdf
-->

---

## 具体例

<div class="cols">
<div class="box">
<b>固定セルのピック&プレース</b>
<ul>
  <li>位置・対象・手順がほぼ固定</li>
  <li>高速・高再現性・低レイテンシが重要</li>
  <li><span class="good">古典制御 + 現代制御</span>が主役</li>
</ul>
</div>
<div class="box">
<b>散らかった環境での家庭内片付け</b>
<ul>
  <li>物体・向き・遮蔽・指示が毎回違う</li>
  <li>知覚・言語理解・汎化が必要</li>
  <li><span class="accent">Physical AI + 下位制御</span>が主役</li>
</ul>
</div>
</div>

<!--
話すポイント:
- 新入社員にはこの2例でほぼ伝わる。
- 産業ロボット vs 家庭内ロボットの対比は、なぜ Physical AI が必要かを直感で理解させやすい。
-->

---

## 結論

Physical AI は制御理論の**代替ではなく上位レイヤの拡張**。

- **制御理論**: 安定・追従・外乱抑制・制約対応を実現する
- **古典制御**: よく定義された世界で閉ループ応答を設計する
- **現代制御**: 内部状態と制約を明示して系統的に設計する
- **Physical AI**: 定義しきれない現実世界に、知覚・意味理解・適応を上乗せする

<div class="box small">
<b>新規事業の観点:</b> 狙い目は<b>人が状況判断していた部分</b>を機械にどこまで移せるか。
</div>

<!--
話すポイント:
- 事業ワークに繋げるなら「どのレイヤの課題を解くか」で整理する。
- Physical AI はロボット本体だけでなく、データ、評価、監視、安全にも事業機会がある。
-->

---

## Appendix: モデルベースド vs モデルフリー

- **モデルベースド制御:** 対象を**数式モデル**で表し、それに基づき制御器を設計する（本資料の**古典・現代の中心**）
- **モデルフリー制御:** **明示モデルを設計の前提にしない**。「どう動いたか」のデータ等から制御器を得る（policy 学習など）
- **Physical AI:** 多くの場合**モデルフリー寄り**。ただし、学習でモデルや残差を推定して **MPC などのモデルベースドに渡す**構成も一般的

**モデルベースドの中の二つの柱（対比の軸）**

| 項目 | **古典制御** | **現代制御** |
| --- | --- | --- |
| 変数の見方 | **s 領域**（周波数） | **t 領域**（時間・状態） |
| 表現 | 伝達関数 | 状態方程式 |
| 入出力 | SISO が主 | MIMO も扱いやすい |

<div class="small box" style="margin-top: 10px;">
<b>注意:</b> ジャンルの境界は曖昧で、ここでは多くの現場感覚に近い整理として <b>controlabo「制御図鑑」</b>の切り方に寄せている。
</div>

---

## Appendix: Physical AI のデータパイプライン

<div class="cols">
<div class="box">
<b>6 つのデータソース</b>
<ul class="small">
  <li><b>teleop demo:</b> 人が VR/マスター装置でロボットを動かした記録 (Mobile ALOHA [21], LeRobot [23])</li>
  <li><b>human / egocentric video:</b> 一人称動画 (Ego4D 等)</li>
  <li><b>sim / synthetic:</b> Isaac Sim / <b>NVIDIA Cosmos</b> で生成 [14]</li>
  <li><b>実機ログ:</b> デプロイ後の動作データ</li>
  <li><b>失敗事例:</b> 事故・障害ケース (= 高価値データ)</li>
  <li><b>安全評価セット:</b> <b>ASIMOV</b> 等の意味的安全ベンチ [24]</li>
</ul>
</div>
<div class="box">
<b>データフライホイール</b>
<pre style="font-size:15px; line-height:1.3; background:#f1f5f9; padding:10px; border-radius:6px;">deploy
   ↓
log &amp; failure harvest
   ↓
relabel / curate
   ↓
batch re-train
   ↓
re-deploy</pre>
</div>
</div>

<div class="small box" style="margin-top: 12px;">
モデルの賢さ以上に、<b>データを集め・評価し・再投入するサイクルの質</b>が競争力を決める。制御設計で言う「同定・検証・HIL・実機ログ」が Physical AI では大規模化・自動化されたもの。
</div>

<!--
話すポイント:
- データソースが6種類あると明示する。各社とも「合成だけ」「teleop だけ」ではない。
- データフライホイールは "deploy → log harvest → re-train" のバッチ型。LLM も実は同じで、常時オンライン学習は両者とも研究段階。
- ここまで話すと、事業機会が「データ収集/合成・評価/安全監視・embodiment 統合・業務特化 post-train」に集まる理由が自然に導ける。
-->

---

## Appendix: オフライン学習 vs オンライン学習

<div class="cols">
<div class="box">
<b>学習区分の整理</b>
<ul class="small">
  <li><b>Offline SL (模倣学習, BC):</b> 静的な教師データから学ぶ。<span class="accent">現行の主戦力</span></li>
  <li><b>Offline RL:</b> 追加のオンライン収集なしで、静的データから方策を学ぶ (D4RL 定義)</li>
  <li><b>Online RL:</b> 実機/シムで動かしながら試行錯誤で学ぶ。<span class="warn">現状は限定的</span></li>
  <li><b>Continual / On-device 学習:</b> 稼働中に継続改善。<b>研究段階</b> (破滅的忘却・安全保証が未解決)</li>
</ul>
</div>
<div class="box">
<b>なぜ Online RL が限定的か</b>
<ul class="small">
  <li><b>安全:</b> 試行中に壊れる・人を傷つける恐れ</li>
  <li><b>報酬設計:</b> タスクごとの設計コストが高い</li>
  <li><b>試行コスト:</b> 実機の 1 エピソードが高価・時間がかかる</li>
  <li><b>sample efficiency:</b> 必要サンプル数が非現実的</li>
</ul>
<div class="small" style="margin-top:4px;">→ 現在は「シムで事前学習＋実機で最小限」が現実解 (例: Figure の歩行 [17], π*0.6 [25])</div>
</div>
</div>

<div class="small box" style="margin-top: 12px;">
<b>⚠️ 誤解されやすい 3 点</b><br>
1. <span class="warn">「Physical AI = RL」は誤り</span>。主流は <b>VLM 事前学習 + 模倣学習/SFT + 限定的 RL</b> の混成。<br>
2. <span class="warn">「オフラインなら安全」は誤り</span>。データ偏り・OOD・ラベル漏れ・実装安全は別問題。<br>
3. <span class="warn">「合成データが実機データを置き換える」は誤り</span>。実態は<b>補完関係</b>。各社とも実機データを捨てていない。
</div>

<!--
話すポイント:
- 「AI = RL」という直感は強いが、VLA 時代の主流は模倣学習 + SFT。RL は「最後の詰め」に限定されている。
- オフライン/オンラインの区別は D4RL の定義に沿う。現場での online 学習はまだハードル高い。
- 誤解3点は、事業観点でも設計観点でもミスリードを生むので、最初に潰しておく。
-->


---

## Appendix: LLM の運用実態

2026 年現在、商用 LLM (GPT / Claude / Gemini など) も、重みをリアルタイムで更新してはいない。**バッチ再学習 + 検索/記憶の補助** で運用している。

| 要素 | 実態 | 例 |
| --- | --- | --- |
| 基盤モデルの重み更新 | **定期的なバッチ再学習** (世代交代) | Claude 3 → 3.5 → 4 のようなリリース |
| データカットオフ | ある時点で固定 | "knowledge cutoff: Jan 2026" など |
| RLHF / Constitutional AI / DPO | **訓練時に実施** (バッチ) | ユーザー対話では重み更新されない |
| ユーザーフィードバック (👍 / 👎) | ログ蓄積 → 次期学習で使用 | リアルタイム反映ではない |
| in-context learning | **会話内だけ** (重み更新ではない) | セッション終了で消える |
| RAG / memory 機能 | 外部ストレージ検索 (重み更新ではない) | ChatGPT Memory, Claude Projects など |
| fine-tuning API | ユーザー主導のバッチ学習 | OpenAI / Anthropic の fine-tuning |

<div class="small box" style="margin-top: 10px;">
「AI = 常時学習」は誤解。LLM も Physical AI も、<b>重み更新はバッチで、推論中の適応は in-context / RAG / memory が担う</b>構造は共通。差分は、Physical AI の<b>物理リスク</b>と、1 エピソードの試行コストが桁違いに高い点。
</div>

<!--
話すポイント:
- 「ChatGPT は毎日賢くなる」は誤解。重み更新は世代交代で数週間〜数ヶ月ごと。
- RAG / memory は「推論中の適応」であって「学習」ではない。ここを混同すると Physical AI の学習サイクル議論がぶれる。
-->

---

## 参考資料 (1/4): 学術・教科書系

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

</div>

<!--
話すポイント:
- 古典・現代制御の基礎理論に関するリファレンス。
- 時間がなければ [1][3] の2本で古典→現代の流れを押さえられる。
-->

---

## 参考資料 (2/4): Physical AI: 概念・基盤モデル・世界モデル

<div class="tiny">

**[7] NVIDIA Glossary — What is Physical AI?**  
https://www.nvidia.com/en-us/glossary/generative-physical-ai/

**[8] NVIDIA Blog — What Is NVIDIA's Three-Computer Solution for Robotics?**  
https://blogs.nvidia.com/blog/three-computers-robotics/

**[9] Google DeepMind — Gemini Robotics brings AI into the physical world**  
https://deepmind.google/blog/gemini-robotics-brings-ai-into-the-physical-world/

**[14] NVIDIA — Cosmos World Foundation Model Platform for Physical AI (press release)**  
https://investor.nvidia.com/news/press-release-details/2025/NVIDIA-Launches-Cosmos-World-Foundation-Model-Platform-to-Accelerate-Physical-AI-Development/default.aspx

**[15] Google DeepMind — Gemini Robotics 1.5 / Robotics-ER (agents into the physical world)**  
https://deepmind.google/blog/gemini-robotics-15-brings-ai-agents-into-the-physical-world/

**[19] NVIDIA — Isaac GR00T N1, Open Humanoid Robot Foundation Model (press release)**  
https://investor.nvidia.com/news/press-release-details/2025/NVIDIA-Announces-Isaac-GR00T-N1--the-Worlds-First-Open-Humanoid-Robot-Foundation-Model--and-Simulation-Frameworks-to-Speed-Robot-Development/default.aspx

**[20] Google DeepMind — RT-2: Vision-Language-Action Model (project page)**  
https://robotics-transformer2.github.io/

</div>

<!--
話すポイント:
- 定義の共通認識は [7][9]。world model の中核は [14]、System 2/1 の具体例は [15]、オープン humanoid foundation model は [19]、VLA 化の転回点は [20]RT-2。
- 最初の1本だけ読むなら [15] を推す（System 2/1 + low-level controller 接続の両方が書かれている）。
-->

---

## 参考資料 (3/4): Physical AI: 代表 VLA・データ・学習・安全

<div class="tiny">

**[16] Figure — Helix: A Vision-Language-Action Model for Humanoids**  
https://www.figure.ai/news/helix

**[17] Figure — Reinforcement Learning for Humanoid Locomotion (kHz torque control)**  
https://www.figure.ai/news/reinforcement-learning-walking

**[18] Physical Intelligence — π0: Our First Generalist Policy**  
https://www.physicalintelligence.company/blog/pi0

**[21] Stanford — Mobile ALOHA (whole-body teleoperation + imitation learning)**  
https://mobile-aloha.github.io/

**[22] OpenVLA — An Open-Source Vision-Language-Action Model (project page)**  
https://openvla.github.io/

**[23] Hugging Face — LeRobot: Models, datasets and tools for real-world robotics**  
https://huggingface.co/docs/lerobot/index

**[24] ASIMOV Benchmark — Semantic safety evaluation for robotics**  
https://asimov-benchmark.github.io/v1/

**[25] Physical Intelligence — π*0.6: Offline RL + on-robot improvement**  
https://www.physicalintelligence.company/blog/pistar06

</div>

<!--
話すポイント:
- 代表 VLA と System 2/1 実装は [16][17][18]、teleop + BC の基盤は [21][22][23]、安全評価ベンチは [24]、オンライン RL の事例は [17][25]。
- Stage 2-3 の実体を見たい人は [21][22]、Stage 4 (RL) の実体は [25]。
-->

---

## 参考資料 (4/4): 制御体系の解説記事

<div class="tiny">

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
- 制御の全体像・古典/現代の対比・AI との役割分担は [11][10][13]、手法の樹状図は [12]。
- 日本語で一気に俯瞰したい人向けの入口。
-->
