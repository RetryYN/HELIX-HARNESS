---
plan_id: PLAN-REVERSE-210-l0-l8-design-consistency-audit
title: "PLAN-REVERSE-210: L0-L8 semantic audit fullback（意味監査 fullback）"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: fullstack
status: confirmed
created: 2026-06-30
updated: 2026-07-01
owner: Codex
forward_routing: L5
promotion_strategy: reuse-with-hardening
agent_slots:
  - role: tl
    slot_label: "TL - design drift reverse 判断"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-210-l0-l8-design-consistency-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-l0-l8-design-consistency-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L4-pillar-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L5-detail/pillar-detail-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L5-pillar-integration-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-210-l0-l8-design-consistency-audit.md
  requires:
    - docs/plans/PLAN-L7-210-l0-l8-design-consistency-audit.md
    - docs/governance/helix-l0-l8-design-consistency-audit.md
  blocks: []
backprop_scope:
  - layer: requirements
    decision: updated
    evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    reason: "2026-06-30 の L1 §2.8 visualization amendment は、freeze 済み 43-item descent の背後に隠さず、S4-pending の L3 amendment frontier として明示的に記録した。"
  - layer: L4-basic-design
    decision: updated
    evidence_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    reason: "L4 は、visualization Tree View/Webview の boundary work が S4 routing までは confirmed 10 block / 43 requirement set の外側であることを明記した。"
  - layer: L5-detailed-design
    decision: updated
    evidence_path: docs/design/helix/L5-detail/pillar-detail-design.md
    reason: "L5 は、PLAN-L7-206 の first response と将来の visualization graph/read-model/drill-down contracts を分離した。"
  - layer: L0-L6-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "L3-L6 design/test-design は、2026-06-28 frozen descent と revised visualization amendment を区別した。"
  - layer: L7
    decision: updated
    evidence_path: docs/governance/helix-l0-l8-design-consistency-audit.md
    reason: "audit は、L7 feature-pack roadmap が L0-L8 boundary では closed であり、PLAN-L7-146 は active frontier ではなく version-up parked のままであることを記録した。"
  - layer: L8
    decision: updated
    evidence_path: docs/governance/helix-l0-l8-design-consistency-audit.md
    reason: "audit は、現在の G8 closure が pre-amendment boundary だけを対象にした selected workflow coverage であり、revised visualization request は L0-L8 complete ではないままであることを記録した。"
---

# PLAN-REVERSE-210: L0-L8 semantic audit fullback（意味監査 fullback）

## 理由

ユーザーは、完了主張が意味論的に不十分であると指摘した。正しい route は design-drift Reverse
である。L0-L8 の意味連鎖を点検し、有効な design descent を保持し、不足していた完了境界を
テスト可能な audit へ back-propagate する。signal は `design_drift`、PLAN enum route は
`confirmed_reverse_type=fullback`。

## R4 Forward Routing（R4 Forward 合流）

Forward route は `PLAN-L7-210-l0-l8-design-consistency-audit`。最初の audit は
2026-06-30 L1 §2.8 visualization amendment の影響を過小評価していたため、L3-L6
design/test-design に明示的な amendment frontier を受け渡す。forward correction は、
pre-amendment L0-L8 boundary を narrow-complete として保ちながら、revised request は
visualization L3/L4/L5/L6/L7 work が S4 で route されるまで L0-L8 complete ではないと
明記すること。`PLAN-L7-141` は activated、`PLAN-L7-146` は version-up parked、L10/runtime
frontiers は completed work に数えない。

2026-07-01 の re-read では同じ R4 route を維持し、狭い correction を追加する。audit は
pair-agent TDD、setup / rename command availability、visualization amendment、現在の
outstanding blockers に対する明示的な feature-list check を記録する。これは既存の design
boundary の明確化であり、`旧 state path -> .helix` の適用や S4-pending work の昇格を承認するものではない。

## §3 工程表 (Step + 進捗)

### Step 1: [直列] drift signal 確認
直列理由: downstream_dependency

`route eval --signal design_drift` は Reverse mode を推奨し、auto apply なし、preflight required を返した。

### Step 2: [直列] R4合流先決定
直列理由: downstream_dependency

L0-L6 の freeze 済み意味連鎖は保持し、2026-06-30 visualization amendment を未降下 frontier として
L3/L4/L5/L6/test-design に back-propagate してから `PLAN-L7-210` に戻す。

### Step 3: [直列] review 確認
直列理由: downstream_dependency

self review で、pre-amendment L0-L8 の narrow-complete、revised request の未完了、post-L8 /
version-up 未了を混同していないことを確認する。

## §3.1 実装計画

- 情報源: `bun run src/cli.ts route eval --signal design_drift --format json`。
- 変更対象: Reverse 記録、governance audit、L3-L6 design/test-design の amendment frontier 注記。
