---
plan_id: PLAN-L3-27-github-trace-authority-hygiene
title: "PLAN-L3-27 (add-design): L3 trace・authority hygiene"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-23 L3からL4への抜け漏れをチェックして閉じる"
created: 2026-07-23
updated: 2026-07-23
owner: Codex / TL
parent_design: docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
pair_artifact: docs/test-design/helix/github-autonomous-operations-acceptance.md
agent_slots:
  - role: tl
    slot_label: "TL — GH/worker trace closure、ADR-009/010 authority、canonical pair metadataの監査"
  - role: qa
    slot_label: "QA — GH-AC/T exact set、WCC FR/AC/HAT coverage、legacy layer leakageのnegative監査"
generates:
  - artifact_path: docs/plans/PLAN-L3-27-github-trace-authority-hygiene.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/github-operations-projection.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/github-autonomous-operations-acceptance.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/scrum-reverse-entity-model-acceptance.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/worker-common-contract-acceptance.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L3-26-github-plan-workflow-governance.md
  requires:
    - docs/design/helix/L3-requirements/github-plan-workflow-governance-requirements.md
  references:
    - docs/governance/l3-progression-authority-rebaseline-2026-07-19.md
    - docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md
  blocks: []
---

# PLAN-L3-27: L3 trace・authority hygiene

## §0 目的

G3 freeze再集計で検出したphantom requirement、欠落system oracle、worker FR oracle不足、L3↔L10 metadata drift、解消済みADR authority衝突の
stale blockerを、意味追加なしの正規化sliceとして閉じる。

## §工程表

### Step 1: ID・oracle closure [直列]

- 未定義`GH-FR-000`参照を除去し、実定義集合`GH-FR-001..023`へ一致させる。
- `GH-AC-013`へ`GH-T-013`を追加し、`GH-AC-001..034`と`GH-T-001..034`をexact setにする。
- worker共通契約の未接続`WCC-FR-03/05/06/08`へL10 oracleを追加し、`WCC-FR-01..08`を全件traceする。

### Step 2: canonical pair・authority正規化 [直列]

- GitHub自律運用とScrum Reverse entityのtest designをcanonical L3↔L10へ直し、旧L12をcompatibility metadataへ隔離する。
- ADR-009/010は同一authority epochの層別責務として扱い、解消済み衝突をruntime全体の停止理由にしない。

### Step 3: 検証・独立レビュー [直列]

- ID集合監査、plan lint、targeted test、typecheckをgreenにする。
- current HEADをClaude AI-Bへtakeover memoryで依頼し、G3 packetとは別PRで閉じる。

## §受入条件

- AC-1: `GH-FR-000`参照が0で、`GH-FR-001..023`だけが存在する。
- AC-2: `GH-AC-001..034`と`GH-T-001..034`が欠番・重複なしで一致する。
- AC-3: 対象test designが`executed_at_layer: L10`で、旧L12は`legacy_executed_at_layer`にだけ残る。
- AC-4: ADR-010準拠runtime設計とv0.5.1 finding closureを分離し、staleな全面停止条件を残さない。
- AC-5: `WCC-FR-01..08`と`WCC-AC-01..06`がL10 HATへ欠落なく接続される。
