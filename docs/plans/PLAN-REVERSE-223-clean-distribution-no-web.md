---
plan_id: PLAN-REVERSE-223-clean-distribution-no-web
title: "PLAN-REVERSE-223: no-web clean distribution の補完"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: fullback
drive: be
status: confirmed
created: 2026-07-01
updated: 2026-07-01
owner: TL (Codex)
forward_routing: L5
promotion_strategy: reuse-with-hardening
backprop_scope:
  - layer: requirements
    decision: not_impacted
    reason: "PLAN-L7-157 はすでに screenless clean distribution を要求している。この slice は product requirements を変えずに、L6/L7 の解釈と evidence を強化する。"
  - layer: L4-basic-design
    decision: not_impacted
    reason: "setup/distribution block は architecture level ですでに clean distribution を担っている。この slice は L6/L7 artifact contract を強化する。"
  - layer: L5-detailed-design
    decision: not_impacted
    reason: "schema、API、詳細な interface shape の変更は不要であり、既存の distribution planning surface を再利用する。"
  - layer: L6-function-design
    decision: updated
    evidence_path: docs/design/harness/L6-function-design/setup-solo-team.md
    reason: "clean export contract は central UI runtime、web-only tests、frontend residue を除外する。"
  - layer: HELIX-L6-function-design
    decision: updated
    evidence_path: docs/design/helix/L6-function-design/pillar-function-design.md
    reason: "HC-P6 は no-web clean distribution semantics と optional web module loading を記録する。"
  - layer: L3-acceptance-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L3-acceptance-test-design.md
    reason: "AT-DIST-001 は install/status/distribution/typecheck の前に `src/web/` と web-only tests が存在しないことを観測する。"
  - layer: L7-unit-test-design
    decision: updated
    evidence_path: docs/test-design/harness/L7-unit-test-design.md
    reason: "U-SETUP-011 と U-SETUP-013 は no-web distribution を artifact exclusion と core CLI viability として表現する。"
  - layer: HELIX-L6-test-design
    decision: updated
    evidence_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    reason: "HU-PILLAR-DIST-01 は HC-P6 distribution を、より強い no-web clean artifact contract に結び付ける。"
  - layer: prior-plan
    decision: updated
    evidence_path: docs/plans/PLAN-L7-157-distribution-clean-pull.md
    reason: "R2/AC2 と cross-review M2 は、弱い no-screen wording を明示的に閉じる。"
agent_slots:
  - role: tl
    slot_label: "TL - no-web 補完"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-223-clean-distribution-no-web.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-223-clean-distribution-no-web.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-157-distribution-clean-pull.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L3-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L6-pillar-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-223-clean-distribution-no-web.md
  requires:
    - docs/plans/PLAN-L7-223-clean-distribution-no-web.md
review_evidence:
  - reviewer: codex-intra-runtime
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-01T10:23:04+09:00"
    tests_green_at: "2026-07-01T10:23:04+09:00"
    verdict: pass
    scope: "PLAN-L7-157 R2/AC2 の no-web distribution 解釈を、L6 function design、HELIX HC-P6、L3 acceptance design、L7 unit design、HELIX HU-PILLAR-DIST-01 へ補完した。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/distribution-acceptance.test.ts tests/web.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:23:04+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:489ffab05e118deb404f475310a65dd58650da75465bc3124ad007fa45f567f4"
      - kind: smoke
        command: "bun test tests/setup.test.ts tests/distribution-acceptance.test.ts tests/web.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:23:04+09:00"
        evidence_path: tests/distribution-acceptance.test.ts
        output_digest: "sha256:3c11dda19ff144068769244a9dd28f02ff0c06328a98a1b9a354d5879b80ae5c"
      - kind: smoke
        command: "sha256sum docs/plans/PLAN-L7-157-distribution-clean-pull.md docs/design/harness/L6-function-design/setup-solo-team.md docs/design/helix/L6-function-design/pillar-function-design.md docs/test-design/harness/L3-acceptance-test-design.md docs/test-design/harness/L7-unit-test-design.md docs/test-design/helix/L6-pillar-unit-test-design.md"
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-01T10:23:04+09:00"
        evidence_path: docs/plans/PLAN-L7-157-distribution-clean-pull.md
        output_digest: "sha256:56d86a78bcfb8855585540e7ac0ca5be96354743b97df36737248188b60981d2"
---

# PLAN-REVERSE-223: no-web clean distribution の補完

## 目的

distribution design を補完し、"screenless" を artifact semantics で評価する。
clean package は UI runtime files、web-only tests、frontend residue を含んではならない。
一方で dogfood source repo は、将来の UI 作業のために web slice を保持してよい。

## 補完結果

- PLAN-L7-157 R2/AC2 は no-web distribution を明示的に定義する。
- L6 setup design と HELIX HC-P6 は、`src/web/`、`tests/web.test.ts`、frontend residue を除外する clean export contract を記述する。
- L3/L7 harness test design と HELIX HU-PILLAR-DIST-01 は同じ contract を観測する。
- 実装は additive のままで、source-repo web tests の green を維持する。

## 受入条件

- `PLAN-L7-223` とこの Reverse PLAN は相互に require する。
- product requirement expansion はない。これは既存要求済みの screenless clean distribution を強化するだけである。
- Source web implementation は clean distribution の外側で引き続き利用可能である。
