---
title: "GitHub 自律運用 受入テスト設計"
layer: L3
executed_at_layer: L10
legacy_executed_at_layer: L12
canonical_layer_scheme: L1-L12
artifact_type: test_design
status: proposed
created: 2026-07-18
updated: 2026-08-16
owner: QA
pair_artifact: docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
---

# GitHub 自律運用 受入テスト設計

- pair: `docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md`
- status: proposed
- 実行層: L10（canonical pair `L3↔L10`。旧L12表記はcompatibility metadataに限定）

## テスト束

| Test ID | 対応AC | 入力 | 期待結果 |
|---|---|---|---|
| GH-T-001 | GH-AC-001 | current workflow identity exact tuple、必須欠落、部分tuple、未知axis／ID、stale registry、legacy current出力、複数候補fixture | exact tupleだけadmitし、その他はreason code付きfail-close。分類失敗をFull V／Forward／Scrumへ丸めない |
| GH-T-002 | GH-AC-002 | requirement closure外の変更を含むPR diff | merge不可、分離Issue候補生成 |
| GH-T-003 | GH-AC-003 | 不正prefix、stale base、foreign ownership branch | branch guardが全件検出 |
| GH-T-004 | GH-AC-004 | 正常/改竄/orphan/片肺PR trace block | 正常のみvalidate |
| GH-T-005 | GH-AC-005 | required legのsuccess/failure/cancel/skip直積 | 全success以外aggregate fail |
| GH-T-006 | GH-AC-006 | Ruleset drift fixture | check/strict/force/deletion/bypass各差分を個別finding化 |
| GH-T-007 | GH-AC-007 | CI failure webhookの重複配送を含むevent列 | self-heal 1 episode、上限時Recovery 1件 |
| GH-T-008 | GH-AC-008 | merge webhook再送 | projection冪等、全recordが同一HEADへ収束 |
| GH-T-009 | GH-AC-009 | layer/release tag fixture | receipt完全時のみtag候補、欠落時reject |
| GH-T-010 | GH-AC-010 | chatで追加された要求 | provenance付きledger rowとdispositionを生成 |
| GH-T-011 | GH-AC-011 | CLI-only HARNESS案件 | L2を暗黙欠落にせずN/A evidenceを生成 |
| GH-T-012 | GH-AC-012 | count mismatch/orphan/重複/unresolved blocker fixture | 完了率100%を拒否 |
| GH-T-013 | GH-AC-013 | `Closes #N`付きPRからOutcome、closure receipt、子Issue disposition、PO decisionを一つずつ欠落させ、rejected/quarantined/superseded/cancelledを投入する | resolved系の欠落closeをblockし、不採用系は正規decision receiptだけを受理し、superseded/cancelledはPO decision欠落時に拒否する |
| GH-T-014 | GH-AC-016 | CI greenだがAI-B receiptなし、AI-Bが編集したHEAD、review後drift、全receipt同一HEADの4 fixture | 最初の3件を拒否し、read-only AI-B reviewと全receiptが同一HEADのfixtureだけ明示merge可能 |
| GH-T-015 | GH-AC-017 | current contract内の局所correctness/security、独立lifecycle、性能改善、命名提案のfinding fixture | 局所correctness/securityはcurrent PR修正、独立lifecycle/性能/命名は後続Issueとなりcurrent PRへ再流入しない |
| GH-T-016 | GH-AC-034 | required CI greenでnative auto-merge設定済みのPRと、AI-Bがcurrent HEADを再照合するPR | native auto-mergeを拒否し、後者だけ明示merge可能 |

## 実環境照合

fixtureだけで合格にしない。GitHub read-only APIでdefault branch、active Ruleset、required checks、open PR、open Issue、workflow runを観測し、authoring policyとの差分を検証する。書込み適用、release、tag、cutoverは別のaction-binding approvalを要求する。

## 証跡要件

各実行は command、exit code、output digest、HEAD、GitHub observation timestampを保存する。再実行不能な画面キャプチャだけを合格根拠にしない。
