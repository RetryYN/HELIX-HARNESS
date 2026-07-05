---
plan_id: PLAN-REVERSE-209-objective-evidence-audit
title: "PLAN-REVERSE-209: active objective evidence audit back-fill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: fullstack
status: confirmed
created: 2026-06-30
updated: 2026-06-30
owner: Codex
forward_routing: L5
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    evidence_path: docs/design/helix/L1-requirements/pillar-requirements.md
    reason: "The audit indexes existing objective evidence. It does not add new product requirements."
  - layer: L4-basic-design
    decision: not_impacted
    evidence_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    reason: "No block boundary changes."
  - layer: L5-detailed-design
    decision: not_impacted
    evidence_path: docs/design/harness/L5-detailed-design/module-decomposition.md
    reason: "No module split changes."
  - layer: L6-function-design
    decision: not_impacted
    evidence_path: docs/design/harness/L6-function-design/function-spec.md
    reason: "Existing L6 contracts are cited as evidence; no contract change."
  - layer: L7-unit-test-design
    decision: updated
    evidence_path: tests/goal-evidence-audit.test.ts
    reason: "A focused audit oracle and doctor hard gate prove the objective evidence table stays aligned to completionReadiness."
agent_slots:
  - role: tl
    slot_label: "TL - objective evidence back-fill review"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-209-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L1-requirements/pillar-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L4-basic-design/pillar-basic-design.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L5-detailed-design/module-decomposition.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/governance/helix-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/objective-evidence-audit.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/goal-evidence-audit.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-209-objective-evidence-audit.md
  requires:
    - docs/plans/PLAN-L7-209-objective-evidence-audit.md
  references:
    - docs/governance/helix-objective-evidence-audit.md
    - src/lint/objective-evidence-audit.ts
    - src/doctor/index.ts
    - tests/goal-evidence-audit.test.ts
    - tests/doctor.test.ts
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-06-30T11:02:00+09:00"
    tests_green_at: "2026-06-30T11:01:00+09:00"
    verdict: approve
    scope: "Back-fill confirms the evidence audit is an index over existing proof and current completion blockers, and doctor now hard-gates false full-completion claims."
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/goal-evidence-audit.test.ts tests/doctor.test.ts tests/lint-wiring.test.ts --run"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-06-30T11:01:00+09:00"
        evidence_path: tests/goal-evidence-audit.test.ts
        output_digest: "sha256:86e589da40d3d5d7451e25f067e4714fbe508fcf23f1f93befed42bb51bf2f48"
---

# PLAN-REVERSE-209: objective evidence audit back-fill（active objective 証跡監査 back-fill）

## R0-R4 要約

- R0: active objective の evidence は複数の L3-L7 artifacts に分散していた。
- R1: as-built work は chat summaries だけでは意味的に audit しにくかった。
- R2: 正しい as-is model は、requirement evidence index と既存の design / test / source /
  doctor gates の組み合わせである。
- R3: intent は、objective を green command counts に還元せず、completion evidence を点検可能にすること。
- R4: L7 audit artifact、test oracle、doctor hard gate へ route する。

## 解消したギャップ

objective evidence table は、各 user requirement から current-state proof、または proof が未取得の場合の
明示的 blocker への安定した index を提供する。さらに `helix doctor` は semantic completion drift を拒否する。
