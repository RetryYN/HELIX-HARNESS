---
status: draft_candidate
authority_status: proposed_pending_l3_confirmation
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
version: 0.2
owner: QA / UIL-04
plan: PLAN-L3-89-mechanism-adequacy-authority
parent_design: docs/governance/candidates/mechanism-adequacy-requirements.md
pair_artifact: docs/governance/candidates/mechanism-adequacy-requirements.md
---

# 機構充足性評価：受入候補

以下は未実行のoracle仕様であり、green証拠ではない。

| AC | 要件 | 正例と独立した反例 |
|---|---|---|
| MA-AC-01 | MA-R-01 | stable IDで要求から運用まで辿れる。生ログ・AI感想単独、欠落edgeを拒否 |
| MA-AC-02 | MA-R-01 | 宣言・未実装・未接続・未検収・実稼働を区別。未実装を能力不存在へ変換しない |
| MA-AC-03 | MA-R-02 | 実装・接続不備の正例。誤設定を新機構必要とするmutationを拒否 |
| MA-AC-04 | MA-R-02 | 既存方式で解決する正例。検索漏れによる新機構判定を拒否 |
| MA-AC-05 | MA-R-02 | 部品再構成の正例。組合せ未調査を不存在へ変換しない |
| MA-AC-06 | MA-R-02, MA-R-03 | 範囲付き不足証明の正例。失敗回数・AI主張・期限切れ単独の新機構判定を拒否 |
| MA-AC-07 | MA-R-02, MA-R-06 | 調査打切りを証拠不足へ分類。unknownを成功／不存在へ補完しない |
| MA-AC-08 | MA-R-02 | 要求矛盾を再検討へ返す。新機構の追加だけで矛盾解消扱いにしない |
| MA-AC-09 | MA-R-03 | 限定した最小反例を検査。相関から因果、有限事例から普遍的不可能を主張しない |
| MA-AC-10 | MA-R-03 | 既存解・反証で撤回／再分類。反証破棄と旧receipt上書きを拒否 |
| MA-AC-11 | MA-R-04 | 設計候補の不足能力・再利用・検証・副作用・rollbackを照合。保証緩和を改善にしない |
| MA-AC-12 | MA-R-04 | 六分類とscope/change class/routeを分離して既存配車。候補だけの実装・merge・publishを拒否 |
| MA-AC-13 | MA-R-05 | receiptの範囲・revision・digest・未知事項・期限を照合。wrong HEAD/stale/generation/environment混載を個別拒否 |
| MA-AC-14 | MA-R-05 | journal順序変更・二重event・DB再構築で同一exact set。欠落event・edge・digest driftを拒否 |
| MA-AC-15 | MA-R-05 | 固定AI出力のprovenanceと機械証拠を分離。AI仮説を検証済み証拠へ偽装しない |
| MA-AC-16 | MA-R-06 | 通常観測の追加LLM呼出し0とAIなしの保留／統制を実測。重複解析・無限再生成を拒否 |
| MA-AC-17 | MA-R-06 | probeの仮説・停止条件・各budgetを実測。枯渇時は証拠不足、無関係な作業は停止しない |
| MA-AC-18 | MA-R-07 | #1344等を当時revisionで再生。将来の正解混入と予測／実測／欠測混同を拒否 |
| MA-AC-19 | MA-R-07 | 誤昇格・見逃し・費用・手戻り・再発で効果評価。新機構件数だけの成功判定を拒否 |
| MA-AC-21 | MA-R-04, MA-R-07 | 実ログ→評価→設計→既存workflow→独立review/検証→main read-after→L12観測を一巡。局所green・mergeだけで閉じない |

## L12効果観測の受渡し

MA-R-07の指標とMA-AC-21の追跡を[運用検証候補](mechanism-adequacy-recognition.md)のMA-OP-01..04へ接続する。観測window、baseline、適用条件、欠測理由を後続PLANで確定する。
本候補にL12実測や承認が存在するとは扱わない。

HELIXWebなしの現行環境でMA-AC-21を検収する。権限越境は既存policyを使ってMA-AC-17で拒否する。Web専用基盤・予約schema・依存・Release条件の混入は不適合とする。
