---
plan_id: PLAN-L10-00-ux-verification-master
title: "PLAN-L10-00: L10 UX 検証 master coverage"
kind: design
layer: L10
drive: fe
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
master_hub: true
agent_slots:
  - role: tl
    slot_label: "TL - L10 UX 検証 coverage 境界"
  - role: qa
    slot_label: "QA - L10 UX evidence review"
generates:
  - artifact_path: docs/plans/PLAN-L10-00-ux-verification-master.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L10-ux/visual-design.md
    artifact_type: design_doc
dependencies:
  parent: null
  requires:
    - docs/design/harness/L2-screen/wireframe.md
    - docs/process/forward/L08-L14-verification-phase.md
  references:
    - docs/plans/PLAN-M-00-verify-cutover.md
review_evidence:
  - reviewer: subagent-doc-coverage
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: explorer
    tests_green_at: "2026-07-04T21:23:00+09:00"
    reviewed_at: "2026-07-04T21:23:00+09:00"
    verdict: pass-with-findings
    scope: "L10 placeholder status was identified; this master records UX verification boundary without claiming G10 PO signoff."
    green_commands:
      - kind: lint
        command: "./scripts/helix plan lint"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-04T21:22:00+09:00"
        evidence_path: tests/plan-id-naming.test.ts
        output_digest: "sha256:9fa002ed0848a3f2c4aec076fabcfdd4e1c6d6391654f4089473d92a2eb9677d"
      - kind: unit_test
        command: "bun run test:local"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-04T21:18:00+09:00"
        evidence_path: tests/screen-impl-pair-freeze.test.ts
        output_digest: "sha256:be70e1ec32aae3757140516f20e104fa4ea52e5abc0e4ace943fbdfffa469275"
---

# PLAN-L10-00: L10 UX 検証 master coverage

## 目的

L10 の placeholder 扱いを「検証境界」に更新し、G10 完了条件と未完了 blocker を明確にする。

## 範囲

- L2 screen mock の右腕として UX / WCAG / render evidence の条件を示す。
- G10 は `g10-ux-evidence-v1` manifest と `g10-ux-workflow` doctor gate で selected UXV family と
  advisor-fable evidence binding を検査する。
- G10 PO signoff、実レンダリング全面証跡、accessibility closure は本 PLAN だけでは完了しない。

## DoD

- [x] L10 個別 PLAN が存在する。
- [x] L10 design doc が placeholder ではなく検証境界として読める。
- [x] G10 selected UXV evidence manifest と doctor gate が存在する。
- [x] G10 未完了条件を明示する。
