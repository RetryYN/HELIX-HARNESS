---
title: "HELIX-LABO Core EngineのPO提示と判断 decision record（2026-09-26）"
decision_record_id: HDEC-LABO-CORE-ENGINE-2026-09-26
decision_status: recorded
decider_role: PO
decided_at: 2026-09-26
recorded_at: 2026-09-26
source: docs/helix-labo/sources/labo-core-engine-po-original-2026-09-26.md
authority_effect: effective_when_this_record_is_admitted_to_main
---

# HELIX-LABO Core EngineのPO提示と判断（2026-09-26）

## 記録の範囲

2026-09-26（Asia/Tokyo）のClaude作業sessionで、POがHELIX-LABOの要求を整理した本文を示した。本書はその会話の記録である。
POの発言はそのまま引用し、AIの整理と区別する。本文の原文は[source snapshot](../../helix-labo/sources/labo-core-engine-po-original-2026-09-26.md)に保存した。
本記録から、要求（L2）の合意、要件（L3）の承認、実装許可、release、Issue closeを生成しない。

## POの提示

POは「新要求追加していい？ラボの要求を整理した。」と述べ、「ラボをこんな感じにするのはどうかね？」として、HELIX-LABO Core Engineの本文を示した。

AIは、次を返した。
- 今の判断と合う点（authorityを持たない、RCLSの引継ぎ、システムと運用の切り分け）。
- 原文で答えが出る未決の点（2.0の外の情報、クローラーとLABOの関係、BRAINの学習）。
- ConceptのLABOの行（実験、比較、改善効果・退行の計測）より役割が広がるため、Conceptの改訂が要るという見立て。

## Conceptとの関係

POは次のように述べた。

- 「コンセプトはざっくり定義しているだけだろ？それとも責務を被っているのか？そうじゃなければこれでいく。」

AIが[Concept](../../concept/helix-concept.md)を確かめた結果：
- Conceptは、1.0の土台で「すべての機構が共通の形で記録し、相関IDで結ぶ」「後から加わる機構が使う評価用の計測・学習用の記録も1.0から記録しておく」としている。
- 原文の観測の集積は、各機構の記録を各機構に残したまま集めるものであり、この土台と合う。
- HELIX-OSの管理（証拠と状態の登録と版の管理）、改善候補の登録と振り分けは、原文でもOSに残る。
- Intelligenceの全体監査・診断とは、次の節の時間軸で分かれる。
- 他の機構の責務と重なるものは見つからなかった。

AIの整理：Conceptは、LABOを大まかに定義している。原文はその範囲を具体にしたもので、他の機構の責務と重ならない。Conceptの機構の行は改めない。POの「これでいく」により、原文をLABOの企画（L1）の土台とする。

## LABOとIntelligenceの時間軸

POは次のように述べた。

- 「あとラボは過去の振り返り、Intelligenceは現状の把握と未来へ行動で見ている時間軸が違くないか？」

AIの整理：
- LABOは過去（何が起き、なぜ起き、何を変えたらどうなったか）を見る。Intelligenceは現在の把握と未来への行動（稼働中の理解・計画・予測・診断・レビュー・配置案）を見る。
- 重なって見える診断、外の情報、botは、この時間軸で分かれる。
  - 終わった仕事の原因の振り返りはLABO、稼働中の診断はIntelligenceが担う。
  - 情報を取りに行くクローラーの発行はIntelligence、取得した情報の評価はLABOが担う。
  - botを動かすのはIntelligence、botの当たり外れの評価はLABOが担う。
- 整理の結果は[LABOのL1企画案](../../helix-labo/L1-planning/labo-intent.md)の「見ている時間軸」に書いた。

## エンジンどうしの接続

POは次のように述べた。

- 「あと各エンジン同士の説即要求間にはコネクタが入って疎結合にするからね？コネクタ数は接続数分増えるって認識にしておいてくれ。」

AIの整理：
- 「説即要求」は、2026-09-25の粒度の指示でいう接続の要求と読んだ。
- エンジンどうしの接続は、それぞれを接続の要求とする。接続の間にはコネクタを入れ、エンジンを疎結合にする。
- コネクタは、接続1つにつき1つ置く。接続が増えれば、コネクタもその数だけ増える。
- この考え方は、HELIX-CONNECTの定義（内部の機構どうしの接続と、内部と外部の接続を担う。2026-09-25の判断）と合う。LABOと他の機構との接続にも同じ考え方を当てる。
- 接続の一覧は、要求（L2）で決める。
- 整理の結果は、LABOのL1企画案の「エンジンと接続」に書いた。

## HELIX-HARNESS-Coreの名称

POは次のように述べた。

- 「あと、ヘリックスコアはカタカナ表記ではなく、HELIX-HARNESS-Coreが正式名称な。」

AIの整理：
- 「ヘリックスコア」と書いてきた部位の正式名称は、HELIX-HARNESS-Coreである。意味は変えず、名称だけを改める。
- 現在の意味を持ち更新され続ける文書（Concept、企画、要求、候補、案内）は、HELIX-HARNESS-Coreへ書き換える。
- 判断記録、監査の記録、source snapshotは、その時点の記録として書き換えない。POの発言の引用もそのまま残す。
- 原文§19の「Product Helix Core」は、各製品のHELIX-HARNESS-Coreと読む。
- 書き換えは、PR #2140と#2142のmerge後に本PRで行う。

## 原文で答えが出た未決の点

PR #2140の[統合要求案パッケージ](../crosswalks/po-optimal-draft-packet.md)が残していた次の点は、POの原文で答えが出た。

| 未決の点 | 原文の答え |
|---|---|
| 2.0でLABOが分解する外の情報 | OSS、設計資料、論文、Issue、PR等（§21） |
| LABOの技術調査とIntelligenceのクローラーの関係 | クローラーやCONNECT等が取得し、LABOが出所を確かめ、分解・比較・実験して、汎用の構造の候補をBRAINへ入れる（§21）。時間軸の整理とも合う |
| BRAINの「学習」は構造の蓄積か、モデルの調整か | BRAINは汎用の構造を持ち、LABOが複数の製品やepisodeから確かめた構造の候補を受け取る（§15）。モデルの学習・チューニング・評価は、3.0以降にIntelligenceがLABOの材料を使って行う（§16） |

## 反映先

- [HELIX-LABOのL1企画案](../../helix-labo/L1-planning/labo-intent.md)を新しく作る。
- [LABOの候補](../../helix-labo/candidates/improvement-research-requirements.md)の親を、L1企画案の要求へ付け替える案を書く。
- 更新され続ける文書の「ヘリックスコア」を、HELIX-HARNESS-Coreへ書き換える。
- 統合要求案パッケージの未決の点、Conceptの2.0の「何を外の情報とするかは未確定」、BRAINの「学習」の未確定の注記は、PR #2140と#2142のmerge後に、本記録に合わせて更新する。
