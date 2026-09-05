---
title: "機構充足性評価の運用検証候補"
layer: L12
canonical_layer: L12
canonical_pair: L1
canonical_vmodel: L1-L12
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
plan: PLAN-L3-89-mechanism-adequacy-authority
related_issue: 1248
pair_artifact: docs/governance/candidates/mechanism-adequacy-vision.md
---

# 企画目的の運用検証

未実施の検証契約。L10の機能oracleや既存完了gateを代替しない。

| 観測ID | L1目的 | 観測と不合格条件 |
|---|---|---|
| MA-OP-01 | MA-BR-01 | 当時のrevisionへ固定した事例集合で六分類の誤昇格・見逃し・保留を測る。保留除外による精度水増し、将来の正解混入を拒否 |
| MA-OP-02 | MA-BR-02 | 評価から候補・実装・独立検証・main・再観測までtraceを追い、手戻り・品質・副作用・再発を比較。mergeだけでは効果確定しない |
| MA-OP-03 | MA-BR-03 | 通常観測の追加LLM呼出し0、診断費用、probe回数、資源上限、打切りを測る。打切りの成功化や無関係な開発停止を拒否 |
| MA-OP-04 | MA-BR-04 | 条件・反例・許諾・出所を保ったLearning受渡しを追跡。tenant越境・重複件数による一般化を拒否。横断前提が未成立なら未実施と記録 |

観測期間、比較可能な環境、目標値、事例集合と評価用正解の生成手順は運用検証PLANで事前固定する。
予測、実測、欠測、改善なし、悪化、inconclusiveを分ける。新機構数や単回成功を製品効果に置き換えない。
L3のMA-R-07、L10のMA-AC-18/19/21を再利用し、独自の測定DBや昇格権限を作らない。
