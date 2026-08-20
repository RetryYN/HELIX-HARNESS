---
title: "typed workflow guide生成・bounded dynamic injection機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-19
updated: 2026-08-20
owner: Codex / TL
plan: docs/plans/PLAN-L7-635-workflow-guide-dynamic-injection.md
pair_artifact: docs/test-design/helix/L8-workflow-guide-dynamic-injection-unit-test-design.md
---

# typed workflow guide生成・bounded dynamic injection機能設計

## 責務

requirements-owned `workflow-classification-registry.v1`の`workflow_model` exact setから、選択された
identityだけのguideを決定的に生成する。guideはrequirements、registry、generated catalogのversionとdigest、
entry signal、工程、gate、必要証跡、exit、stale条件を束縛する。

`--drive`はworkflow選択に使わず、`BE|FE|FULLSTACK|DB|AGENT`のspecialist drive contextとしてだけ受理する。
SessionStartへの注入は、hook入力に明示された`workflow_id`がある場合だけ行い、全workflowの一括注入やsignalからの
推測はしない。

## 契約

- `U-WFGUIDE-001`: workflow_model identityからsource digest付きguideを生成する。
- `U-WFGUIDE-002`: 旧mode、model、共通route identity、legacy catalog routeをcurrent outputへ出さない。
- `U-WFGUIDE-003`: development styleをworkflow modelへ偽装せず、異なるaxisのidentityを拒否する。
- `U-WFGUIDE-004`: `--drive`はspecialist drive exact set以外をfail-closeする。
- `U-WFGUIDE-005`: signalと選択identityの不一致、decision待ち、曖昧入力を推測しない。
- `U-WFGUIDE-006`: registryのworkflow_model exact set全件を欠落・重複なく生成する。
- `U-WFGUIDE-007`: text／SessionStart surfaceは選択guideだけをboundedに注入する。
- `U-WFGUIDE-008`: 実CLIは選択されたworkflow_modelのtyped identityとsource digest付きguideを返す。
- `U-WFGUIDE-009`: 実CLI経由のSessionStartは明示されたworkflowだけをboundedに注入し、session-start証跡を残す。

旧15-route catalogは意味authorityではなくcompatibility inventoryであり、guideのidentity、工程、gateを決定しない。
