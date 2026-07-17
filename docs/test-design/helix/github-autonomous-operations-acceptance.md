---
title: "GitHub 自律運用 受入テスト設計"
layer: L3
executed_at_layer: L12
artifact_type: test_design
status: proposed
created: 2026-07-18
updated: 2026-07-18
owner: QA
pair_artifact: docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
---

# GitHub 自律運用 受入テスト設計

- pair: `docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md`
- status: proposed
- 実行層: L12

## テスト束

| Test ID | 対応AC | 入力 | 期待結果 |
|---|---|---|---|
| GH-T-001 | GH-AC-001 | 各Issue Formの正常/必須欠落/未知drive fixture | 正常のみadmit、その他はreason code付きfail-close |
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

## 実環境照合

fixtureだけで合格にしない。GitHub read-only APIでdefault branch、active Ruleset、required checks、open PR、open Issue、workflow runを観測し、authoring policyとの差分を検証する。書込み適用、release、tag、cutoverは別のaction-binding approvalを要求する。

## 証跡要件

各実行は command、exit code、output digest、HEAD、GitHub observation timestampを保存する。再実行不能な画面キャプチャだけを合格根拠にしない。
