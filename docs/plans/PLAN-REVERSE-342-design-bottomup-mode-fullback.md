---
plan_id: PLAN-REVERSE-342-design-bottomup-mode-fullback
title: "PLAN-REVERSE-342: design-bottomup mode の confirmed PoC fullback"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: agent
status: confirmed
created: 2026-07-06
updated: 2026-07-06
owner: Codex
pair_artifact: tests/scrum-reverse.test.ts
forward_routing: L3
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: process
    decision: updated
    evidence_path: docs/process/modes/discovery.md
    reason: "confirmed PoC の design-bottomup mode を Discovery 合成と Forward descent の正規 route として扱う。"
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    reason: "L3 46 件の confirmed overlay 自体は増やさず、下流実装 frontier として追跡する。"
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    reason: "design-bottomup mode の採用は L4 block 構造を直ちに変更しない。"
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/helix/L5-detail/pillar-detail-design.md
    reason: "design-bottomup mode の採用は L5 契約を直ちに変更しない。"
agent_slots:
  - role: tl
    slot_label: "TL - design-bottomup mode fullback review"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-342-design-bottomup-mode-fullback.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/modes/discovery.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L5-detail/pillar-detail-design.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-DISCOVERY-07-design-bottomup-mode.md
  requires:
    - docs/plans/PLAN-DISCOVERY-07-design-bottomup-mode.md
  references:
    - docs/plans/PLAN-DISCOVERY-07-design-bottomup-mode.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T06:28:00+09:00"
    tests_green_at: "2026-07-06T06:28:00+09:00"
    verdict: approve
    scope: "PLAN-DISCOVERY-07 を archive に戻さず confirmed PoC として扱い、Reverse 合流 PLAN を追加して scrum-reverse orphan を解消する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/scrum-reverse.test.ts --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T06:28:00+09:00"
        evidence_path: tests/scrum-reverse.test.ts
        output_digest: "sha256:80a6f5981de093ebe3d492b30419ae061cef337c16e7ba5ad1a0908327a6bbd5"
---

# PLAN-REVERSE-342: design-bottomup mode の confirmed PoC fullback

## R0-R4 要約

- R0: `PLAN-DISCOVERY-07` は S3 verified 後に confirmed へ戻したため、confirmed PoC として Reverse 合流が必要になった。
- R1: as-built meaning は、backend / docs / DB から画面要求を洗い出して Discovery 合成へ戻す mode である。
- R2: L3 confirmed 46 件の overlay は変更しない。design-bottomup mode は下流実装 frontier として扱う。
- R3: Discovery mode / requirements boundary へ fullback 証跡を置く。
- R4: Forward 返却先は L3。実装は後続 PLAN で扱う。

## Back-Fill した意味

design-bottomup mode は、画面を先に作る shortcut ではない。既存 backend / docs / DB の制約から
要求候補を抽出し、Discovery S4 と Forward descent に戻すための mode である。

## Merge 境界

この Reverse では中央 UI dogfood、VSCode/Webview 実装、write-capable action surface は実行しない。
必要な下流作業は別 PLAN として追跡する。
