---
plan_id: PLAN-L7-259-action-binding-evidence-url-gate
title: "PLAN-L7-259: action-binding evidence URL gate 強化"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "action-binding approval packet の承認前 evidence locator 検証強化。承認・外部 apply・不可逆 action は実行しない。"
owner: TL (Codex)
parent_design: docs/process/forward/L08-L14-verification-phase.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - action-binding evidence URL gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-259-action-binding-evidence-url-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/action-binding-approval-readiness.ts
    artifact_type: source_module
  - artifact_path: tests/action-binding-approval-readiness.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/process/forward/L08-L14-verification-phase.md
  requires:
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
    - src/lint/action-binding-approval-readiness.ts
    - tests/action-binding-approval-readiness.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T13:54:46+09:00"
    tests_green_at: "2026-07-03T13:54:46+09:00"
    verdict: approve
    scope: "action-binding approval packet の review/audit evidence locator を repo-local artifact、digest/run id、GitHub Actions run / PR / commit URL に限定し、任意外部 URL を concrete evidence として通さないようにした。承認・外部 apply・不可逆 action は実行していない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/action-binding-approval-readiness.test.ts tests/cli-surface.test.ts tests/completion-decision-packet.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T13:54:46+09:00"
        evidence_path: tests/action-binding-approval-readiness.test.ts
        output_digest: "sha256:30ea9768456a2ad4fb6353ab890462a50188062ef6ef5607d012f8340deebb74"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T13:54:46+09:00"
        evidence_path: src/lint/action-binding-approval-readiness.ts
        output_digest: "sha256:942892052a28fc39f378e1dcfd92ddd02d0c5bc8589be983247b94f19e943f0b"
---

# PLAN-L7-259: action-binding evidence URL gate 強化

## 目的

action-binding approval は high-impact action の承認前 material なので、`review_approval_evidence` と
`audit_record` が任意の外部 URL だけで concrete 扱いになると、承認者が repo-local artifact や実行証跡へ
再現可能に辿れないまま approval material を信用する余地が残る。

この PLAN は、action-binding evidence locator を repo-local artifact path、digest / run id、または GitHub Actions
run / PR / commit URL のような監査可能 URL に限定し、任意の外部 URL を pending evidence として扱う。

## 変更

- `hasConcreteApprovalEvidenceLocator` で untrusted external URL を concrete evidence として扱わない。
- GitHub Actions run / PR / commit URL は監査可能 locator として許可する。
- 任意 URL が `review_approval_evidence` / `audit_record` violation になる regression test を追加する。
- L6 function spec / L7 test design に action-binding evidence locator の境界を追記する。

## 境界

- action-binding approval は記録しない。
- version-up activation、rename apply、外部 API / infrastructure / secret / production write は実行しない。
- 残 frontier の PO/S4 判断、version-up activation 判断、不可逆 rename/cutover signoff は人間判断のまま残す。

## 完了条件

- untrusted external URL が action-binding evidence として fail-close する。
- trusted GitHub run / PR / commit URL は locator として扱える。
- targeted tests、typecheck、plan lint、doctor が green。
