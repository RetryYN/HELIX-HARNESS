---
plan_id: PLAN-L6-66-fe-roster-orchestration
title: "PLAN-L6-66 (add-design): FE ロスターとSonnet世代SSoTの機能契約"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-12 PLAN-L7-309のlegacy Vペアdebtを正規解消"
created: 2026-07-12
updated: 2026-07-12
owner: Codex
backprop_decision: not_required
backprop_decision_reason: "既存FE roster実装の責任境界とmodel SSoTを正規L6へ具体化する。新規L1/L3要求は追加しない。"
parent_design: docs/design/harness/L6-function-design/fe-roster-orchestration.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE - FE topology/model SSoT契約"
  - role: qa
    slot_label: "QA - U-FEROSTER-001..003敵対検証"
generates:
  - artifact_path: docs/plans/PLAN-L6-66-fe-roster-orchestration.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/fe-roster-orchestration.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/design/design-catalog.yaml
    artifact_type: design_doc
  - artifact_path: tests/fe-roster-orchestration.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-65-plan-specific-vpair-binding.md
  requires:
    - docs/plans/PLAN-L6-65-plan-specific-vpair-binding.md
  references:
    - docs/plans/PLAN-L7-309-fe-roster-orchestration.md
review_evidence:
  - reviewer: codex-fe-roster-l6-reviewer
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T17:57:40Z"
    tests_green_at: "2026-07-11T17:57:31Z"
    verdict: approve_after_fixes
    worker_model: gpt-5
    reviewer_model: gpt-5.6
    scope: "FE topology/model generation L6契約、DbC、shared/runtime allowlist、MODEL_IDS/TIER_TABLE/selectTeamModel/pricing別正本、U001/U002 green、U003 todo route分離を敵対レビューしblocker/high 0。"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/fe-roster-orchestration.test.ts tests/design-coverage.test.ts tests/l6-completion.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T17:57:31Z"
        evidence_path: tests/fe-roster-orchestration.test.ts
        output_digest: "sha256:22ea76f7169d5aae53b2b2cd43d97946193c545dc1b2aaa0beea60f2363e3cb5"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T17:57:31Z"
        evidence_path: docs/design/harness/L6-function-design/fe-roster-orchestration.md
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T17:57:31Z"
        evidence_path: tests/fe-roster-orchestration.test.ts
        output_digest: "sha256:35738456e53e62b12b8a278deb540e4a7f850bfd305b60f5c304445e74daa7d3"
---

# PLAN-L6-66: FE ロスターとSonnet世代SSoT

## 目的

実装済みPLAN-L7-309を、専用L6契約・L8 oracle・生成testへ正規降下する。

## 受入条件

- FE lead/worker/advisorの責任分界がL6本文と`U-FEROSTER-001`で1:1対応する。
- 現行Sonnet世代と履歴pricing保持が`U-FEROSTER-002`で検証される。
- authority解消手続のL8反例・test route `U-FEROSTER-003`が定義済みで、L6 freeze時点ではtodoである。
- `U-FEROSTER-001/002`がgreenである。
- 後続PLAN-L7-424は本PLAN confirmed後、独立reviewを伴うcompleted resolution PLANとして閉じる。
