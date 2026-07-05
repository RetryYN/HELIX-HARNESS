---
plan_id: PLAN-L7-262-branch-protection-script-consumer-gate
title: "PLAN-L7-262: branch protection script consumer gate 強化"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "consumer setup が生成する branch protection script を gh auth/admin preflight 付き apply-capable として検査する実装強化。既定は emit-only で、明示 apply なしに GitHub branch protection は変更しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "explorer - consumer setup artifact gap"
  - role: tl
    slot_label: "TL - branch protection script consumer gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-262-branch-protection-script-consumer-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: tests/distribution-acceptance.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/harness/L6-function-design/setup-solo-team.md
  requires:
    - docs/test-design/harness/L7-unit-test-design.md
    - src/setup/index.ts
    - src/doctor/index.ts
    - tests/setup.test.ts
    - tests/doctor.test.ts
    - tests/distribution-acceptance.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T17:45:00+09:00"
    tests_green_at: "2026-07-03T17:45:00+09:00"
    verdict: approve
    scope: "subagent 指摘に基づき、consumer setup が生成する branch protection script を setup readiness / consumer doctor / distribution acceptance で gh auth/admin preflight 付き apply-capable として検査するようにした。既定は emit-only で remote apply は明示フラグ時だけ許可する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts tests/doctor.test.ts tests/distribution-acceptance.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T17:45:00+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:a7953e6c40c6f322e255a64a4b5ab89d0b1f15b8e246c66c1f71be5c9e4d92a0"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T17:45:00+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:02c34dc8d3947289bd004f0e186cc11d414e512383f4b6c6f09d7192d12a19be"
---

# PLAN-L7-262: branch protection script consumer gate 強化

## 目的

`runHelixProjectSetup` は `scripts/setup-branch-protection.sh` を consumer repo へ生成し、
`githubPlan.branchProtection.scriptPath` として案内する。既存の U-SETUP-022 は built-in template source を検査していたが、
setup readiness、consumer doctor、clean distribution acceptance は consumer repo に投影された script 実体を検査していなかった。

この PLAN の当初方針は、生成済み branch protection script を旧 checklist-only に固定するものだった。
2026-07-05 の後続修正で supersede され、現在は gh auth/admin preflight 付き apply-capable script を consumer artifact gate として固定する。

## 変更

- `branchProtectionScriptIsApplyCapable` を正本とし、`gh auth status`、`gh api -X PUT`、`/branches/main/protection`、`harness-check`、token/secret 非保持を検査する。
- setup artifact readiness に `branch-protection-script-is-apply-capable` を追加する。
- consumer doctor の required file と hard gate に `scripts/setup-branch-protection.sh` を追加する。
- distribution acceptance で generated consumer repo の script 実体を読み、emit-only default と明示 apply 境界を確認する。
- L7 unit test design の U-SETUP-022 を consumer artifact 実体検査まで拡張する。

## 境界

- 既定実行では `gh auth status`、`gh api -X PUT`、branch protection / ruleset apply、外部 GitHub 書き込みは実行しない。
- 明示 `--apply-branch-protection` 時だけ、`gh auth status` と repo admin preflight を通した後に remote apply surface へ進める。
- action-binding approval 記録、GitHub settings 変更、secret 操作は行わない。
- `PLAN-M-02` の rename/cutover approval と `.helix` 実移行は扱わない。

## 完了条件

- setup readiness が gh auth/admin preflight と token/secret 非保持を持たない branch protection script を green にしない。
- consumer doctor が同じ退行を fail-close する。
- distribution acceptance が generated consumer repo の script 実体を確認する。
- targeted tests、typecheck、design-language、plan governance、doctor が green。
