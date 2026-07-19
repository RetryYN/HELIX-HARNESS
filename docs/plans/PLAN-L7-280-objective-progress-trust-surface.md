---
plan_id: PLAN-L7-280-objective-progress-trust-surface
title: "PLAN-L7-280: objective progress 信頼境界 surface"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "progress 表示の信頼境界を明示する L7 gate 強化。D-API/D-DB、実 rename、approval 記録、外部 activation、cutover apply は行わない。"
owner: TL (Codex)
parent_design: docs/governance/helix-objective-evidence-audit.md
pair_artifact: tests/goal-evidence-audit.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - objective progress trust boundary"
  - role: qa
    slot_label: "QA - invalid audit progress regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-280-objective-progress-trust-surface.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/helix-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/objective-evidence-audit.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/goal-evidence-audit.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/governance/helix-objective-evidence-audit.md
  requires:
    - docs/plans/PLAN-L7-209-objective-evidence-audit.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T20:32:56+09:00"
    tests_green_at: "2026-07-03T20:32:56+09:00"
    verdict: approve
    scope: "objectiveProgress に auditOk / auditViolationCount / progressEvidenceTrusted / evidenceTrustReason を追加し、audit invalid の percent を診断用として扱う。readiness ready でも audit invalid なら completionClaimAllowed=false とし、text status の objective-progress 主行に evidence / audit-ok / violations を出す。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/goal-evidence-audit.test.ts tests/cli-surface.test.ts --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T20:32:56+09:00"
        evidence_path: tests/goal-evidence-audit.test.ts
        output_digest: "sha256:5a3f4e74741c58468326ef34a85a84622784fc56ea6dfee75c43a1589db64f48"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T20:32:56+09:00"
        evidence_path: src/lint/objective-evidence-audit.ts
        output_digest: "sha256:57d542eaa7ab794298af76788da500eaa33e94adaf45a2feb25e22452e1ebf73"
---

## 目的

`objectiveProgress.percent` は進捗表示であり、完了証跡ではない。監査マトリクスが壊れている時に 90% や 100% だけが表示されると、G-10 / L14 completion claim の判断材料として誤用される。

この PLAN では、percent を維持したまま信頼境界を明示する。

- audit が green の場合だけ `progressEvidenceTrusted=true`。
- audit が invalid の場合は `completionClaimAllowed=false`、`progressEvidenceTrusted=false`。
- status / handover text の `objective-progress:` 主行に `evidence=trusted|invalid`、`audit-ok`、`violations` を出す。

## 外部 source basis

検証戦略は、OWASP Web Security Testing Guide の「証跡に基づいて検査し、観測結果と判断を分離する」
考え方を参照した。source は `https://owasp.org/www-project-web-security-testing-guide/` と
`https://owasp.org/www-project-web-security-testing-guide/stable/`。本 PLAN では runtime security test
を追加せず、progress 表示を audit 証跡の信頼状態から分離する gate surface に限定する。

## DoD

- [x] invalid audit で percent が残っても `completionClaimAllowed=false`。
- [x] readiness ready かつ audit invalid でも completion claim しない。
- [x] live status JSON は trust fields を返す。
- [x] live status text は trusted evidence を同じ `objective-progress:` 行に出す。
- [x] invalid handover/status text は `objective-progress-evidence: invalid` を出す。
- [x] `npm test tests/goal-evidence-audit.test.ts tests/cli-surface.test.ts --timeout 300000` が green。
- [x] `npm run typecheck` が green。
