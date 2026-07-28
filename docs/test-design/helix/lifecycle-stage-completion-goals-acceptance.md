---
title: "HELIX L10 受入テスト設計 — 工程ゴールと完了権限"
canonical_layer_scheme: L1-L12
layer: L10
paired_requirement_layer: L3
artifact_type: test_design
status: draft
created: 2026-07-29
updated: 2026-07-29
owner: QA / TL / PO
plan: PLAN-L3-47-lifecycle-stage-completion-goals
pair_artifact: docs/design/helix/L3-requirements/lifecycle-stage-completion-goals.md
---

# HELIX L10 受入テスト設計 — 工程ゴールと完了権限

## §0 合否境界

全oracleは`STAGE-GOAL-FR-001`を検証する。文書の存在、status文字列、GitHub green、過去HEAD、
compatibility projectionの成功だけでは合格にしない。

## §1 工程別oracle

| AC ID | 対応requirement | positive oracle | negative oracle |
|---|---|---|---|
| `STAGE-GOAL-AC-001` | `STAGE-GOAL-R-01` | L1目的からL2の対象、利用者、期待結果、範囲、受入基準がexact traceされ、L11受入oracleが同じscopeを検証する | 誰のためか、何を満たすか、非対象、mock適用判断のいずれかを欠く要求freezeを拒否する |
| `STAGE-GOAL-AC-002` | `STAGE-GOAL-R-01` | 利用者／POが要求の達成と非達成を区別できる | 内部test greenだけで利用者受入を代替するclaimを拒否する |
| `STAGE-GOAL-AC-003` | `STAGE-GOAL-R-02` | FR／NFR／AC、境界、owner、入出力、失敗条件、trace、未解決一覧が機械読取可能である | 散文だけ、owner不在、oracle不能、未解決隠蔽があるG3 freezeを拒否する |
| `STAGE-GOAL-AC-004` | `STAGE-GOAL-R-02` | L10が全要件のpositive／negative system oracleをexactly once被覆する | positiveのみ、未実装oracle、別scope oracleで要件完了を主張することを拒否する |
| `STAGE-GOAL-AC-005` | `STAGE-GOAL-R-03` | L4の構成、責務、I/F、主要データフロー、trust boundary、技術方針をL9が結合観測できる | 責務重複、循環依存、owner不在I/F、data flow端点欠落を残すG4を拒否する |
| `STAGE-GOAL-AC-006` | `STAGE-GOAL-R-03` | component変更時に影響I/Fとdata flowを導出できる | diagramまたはcomponent名の存在だけを基本設計完了にしない |
| `STAGE-GOAL-AC-007` | `STAGE-GOAL-R-04` | L5がDbC、例外、状態遷移、永続化、並行性、resource bound、test観点を実装可能な粒度で持つ | 実装者の追加設計判断、未定義分岐、例外欠落を残すG5を拒否する |
| `STAGE-GOAL-AC-008` | `STAGE-GOAL-R-04` | L8 oracleが正常、境界、異常、状態遷移を全て被覆する | happy pathだけのunit designまたはtest数だけの完了claimを拒否する |
| `STAGE-GOAL-AC-009` | `STAGE-GOAL-R-05` | codeが要件、L4/L5、behavior contract、ownerへexact traceされRed→Green→極小Refactorを閉じる | scope外code、設計外責務、未使用抽象化、旧authority依存、test迂回を拒否する |
| `STAGE-GOAL-AC-010` | `STAGE-GOAL-R-05` | code削減後も同じ正負oracleと性能境界を維持する | code量増加または抽象化追加を実装完成の根拠にしない |
| `STAGE-GOAL-AC-011` | `STAGE-GOAL-R-06` | L7〜L11の実行command、exit code、digest、HEAD、独立reviewが同一snapshotに一致する | stale HEAD、片側oracle、未実行test design、CI表示のみ、別branch証拠を拒否する |
| `STAGE-GOAL-AC-012` | `STAGE-GOAL-R-06` | failure mutationが対応するnegative oracleを必ずredにする | mutationを生存させる過大claimまたはoracle文言検査だけを拒否する |
| `STAGE-GOAL-AC-013` | `STAGE-GOAL-R-07` | L12が観測、alert、障害対応、rollback／Recovery、再構築、再入場、改善、L1 feedbackを実証する | owner不在alert、復旧不能state、再入場点欠落、正常時だけの運用testを拒否する |
| `STAGE-GOAL-AC-014` | `STAGE-GOAL-R-07` | 改善findingが現PR blockerとsuccessor Issueへ分類され、非blockerは次dispatchへ送られる | 非blocker改善を現PRへ無限逆流させる運用を拒否する |

## §2 横断oracle

- 3 development styleへ同じ`stage_exit_contract` exact setを適用し、slice境界以外の工程ゴールが一致する。
- Discovery／PoCまたはDesign HARNESSの成果を入力しても、選択済みstyleの正規pair receiptなしに完了しない。
- cutover指示書§5のcompatibility layer scheme、`PRODUCTION_SCRUM_REDUCED_V`、旧drive値をcurrent output、
  review receipt、completion evidenceへ注入するとfail-closeする。
- `unresolved_items`欠落、未分類項目、owner／再入場条件なしdeferをfail-closeする。

## §3 量閉じ

- behavior contract: `STAGE-GOAL-FR-001` exactly one。
- supporting requirements: `STAGE-GOAL-R-01`〜`STAGE-GOAL-R-07` exact 7件。
- acceptance: `STAGE-GOAL-AC-001`〜`STAGE-GOAL-AC-014` exact 14件。
