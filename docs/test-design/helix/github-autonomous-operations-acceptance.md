---
title: "GitHub 自律運用 受入テスト設計"
layer: L3
executed_at_layer: L12
artifact_type: test_design
status: draft
created: 2026-07-18
updated: 2026-07-22
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
| GH-T-013 | GH-AC-013 | `Closes #N`を持つPRのOutcome、closure receipt、子Issue dispositionを個別に欠落させる | 欠落ごとにcloseを拒否し、superseded/cancelledはPO decisionなしで終端化しない |
| GH-T-014 | GH-AC-014 | CI greenの同一diffへ、文脈入力欠落、作成側と同じprovider、別HEADのreview receipt、理由欠落の`degraded_mode`を個別投入する | current HEADに束縛され、必須文脈を全て読んだ別runtime/provider receipt、または理由記録済み`degraded_mode`単一runtime receipt以外はmerge不可 |
| GH-T-015 | GH-AC-015 | current PR HEADから隔離DBを再構築し、event片肺、projection drift、checkpoint stale、schema revision不一致、orphan、push後の旧receiptを個別投入する | source HEAD・event・projection・checkpoint・schemaが一致しstale/orphan 0のDB追従receiptだけを受理する |
| GH-T-016 | GH-AC-016 | 作成AIの内部CI未実行、監査AI自己承認、修正後旧HEAD receipt、別familyクロスレビュー欠落を個別投入する | 作成前内部CIと修正後の別family HELIX subagent review、両CI、DB追従が同じ新HEADで揃うまでmerge不可 |
| GH-T-017 | GH-AC-017 | 内部CIとGitHub Actionsへ同一重要検査集合を独立投入し、各durationとreceipt digestを収集する | 各p95 60秒以内、Full verification p95 3分以内で、同一HEADかつ別receiptの結果digestが一致する |
| GH-T-018 | GH-AC-018 | correctness greenで性能予算だけを超過させ、証拠欠落・検査削減・閾値緩和を個別投入する | 当該correctness結果とmergeを性能だけで偽failureにせず、完全なRecovery Issueを起票し縮退改善を拒否する |
| GH-T-019 | GH-AC-019 | 要求↔モック遷移、要件からの差し戻し、ユーザー承認、承認後PR、別AI reviewを個別に欠落させる | current revisionの相互遷移・差し戻し・承認後だけPR化し、別AI review後だけmerge可能 |
| GH-T-020 | GH-AC-020 | changed Lへ新consumer、未知edge、cycleを追加する | version管理graphから閉包を再導出し、固定表にない到達先も監査対象にする |
| GH-T-021 | GH-AC-021 | DB replayとGitHub再観測後も不一致を残し、通常Issueと性能Recoveryを同時投入する | 自動上書きを拒否しRecovery化し、性能Recoveryを先にdispatchする |
| GH-T-022 | GH-AC-022 | main merge後Full失敗にRecovery修正Issue、修正PR、doctor、別family review、GitHub CI、Issue closureを個別に欠落させる | 通常merge停止を維持し、全修正証拠が同一HEADへ収束しIssue closeした場合だけ解除する |
| GH-T-023 | GH-AC-023 | staging/productionのEnvironment、secret、artifact digestを交差させる | 環境分離と同一artifact promotion以外を拒否する |
| GH-T-024 | GH-AC-024 | production deployから承認、staging、backup、rollback、monitoringを一つずつ欠落させる | 完全なaction-bound receiptだけproduction実行を許可する |

## 実環境照合

fixtureだけで合格にしない。GitHub read-only APIでdefault branch、active Ruleset、required checks、open PR、open Issue、workflow runを観測し、authoring policyとの差分を検証する。書込み適用、release、tag、cutoverは別のaction-binding approvalを要求する。

## 証跡要件

各実行は command、exit code、output digest、HEAD、GitHub observation timestampを保存する。文脈レビューは入力正本digest集合、
reviewer runtime/model/provider、finding/dispositionを保存し、DB追従検証はsource HEAD、event head、projection digest、checkpoint digest、
schema revision、stale/orphan件数、隔離rebuild結果を保存する。再実行不能な画面キャプチャだけを合格根拠にしない。
