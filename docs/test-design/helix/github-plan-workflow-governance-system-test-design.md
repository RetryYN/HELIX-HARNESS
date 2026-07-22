---
title: "GitHub PLAN workflow-model governance システムテスト設計"
layer: L10
artifact_type: test_design
status: draft
created: 2026-07-23
updated: 2026-07-23
owner: QA
pair_artifact: docs/design/helix/L3-requirements/github-plan-workflow-governance-requirements.md
---

# GitHub PLAN workflow-model governance システムテスト設計

- pair: `docs/design/helix/L3-requirements/github-plan-workflow-governance-requirements.md`
- status: draft
- 実行層: L10

## テスト束

| Test ID | 対応AC | 入力 | 期待結果 |
|---|---|---|---|
| GH-T-031 | GH-AC-031 | layerだけのPLAN名、model/path/frontmatter不一致、任意path、nested重複scan、renameだけのmodel遷移を投入する | file write前に拒否し、正規generatorと不変plan_id projection、transition receiptだけを受理する |
| GH-T-032 | GH-AC-032 | Infinity Loop Issueのreceipt欠落、未契約PoC artifactのproduction昇格を投入する | Issue closeとproduction昇格を拒否し、Forward/Production Scrumへの接続を要求する |
| GH-T-033 | GH-AC-033 | 計画済み検証を別Issue化し、予定外findingをV-pairへ埋没させ、closure/review/DB/mergeを個別欠落させる | planned/unplannedを分離し、完全なclosureとIncident→Recovery traceだけを受理する |
| GH-T-034 | GH-AC-034 | gate green後にnative auto-merge、AI-A自己merge、旧HEAD receipt、DB/CI片肺を個別投入する | AI-Bによるcurrent HEAD全receipt再照合と明示merge以外を拒否する |

## 証跡要件

各fixtureはplan_id、workflow_model、layer、artifact_path、route、dependency、source/target HEAD、transition receipt、Issue/PR/merge、
verification/review/DB/CI digestを持つ。path存在やGitHub green表示だけをadmission/closure証拠にしない。
