---
plan_id: PLAN-L7-255-human-review-safety-fields
title: "PLAN-L7-255: human review bundle の safety field 強化"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "completion decision packet の humanReviewBundle に no-apply / plan-only safety field を追加する限定強化。承認・判断・apply は行わない。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L7-254-human-review-owner-timing-fields.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - human review safety fields"
generates:
  - artifact_path: docs/plans/PLAN-L7-255-human-review-safety-fields.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/completion-decision-packet.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/helix/L6-function-design/pillar-function-design.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-254-human-review-owner-timing-fields.md
  requires:
    - src/lint/outstanding.ts
    - src/lint/completion-decision-packet.ts
    - src/cli.ts
    - tests/completion-decision-packet.test.ts
    - tests/cli-surface.test.ts
    - docs/design/helix/L6-function-design/pillar-function-design.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T13:20:00+09:00"
    tests_green_at: "2026-07-03T13:20:00+09:00"
    verdict: approve
    scope: "completion decision packet の humanReviewBundle に safetyReviewFields を追加した。field は dedicated packet の requiredReviewFields から schemaVersion.field として導出し、plan-only / must-not / allowed=false / approval gate 必須条件を PO が completion packet だけで確認できるようにした。承認・判断・apply は実行していない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/completion-decision-packet.test.ts tests/cli-surface.test.ts tests/outstanding.test.ts --timeout 180000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T13:20:00+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:69add338df0009825e84b119cb3331943cfeff28aa3bc964c9106910fbe25c21"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T13:20:00+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:4807c6ce17062a009aeb82df4f2744321c9cab9ef64b2b609c0031fe8739faee"
      - kind: smoke
        command: "npx --no-install tsx src/cli.ts completion decision-packet --json; npx --no-install tsx src/cli.ts completion decision-packet | rg \"safety-fields\""
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T13:20:00+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:ba8fdb9077b5d76231e36e9773a9d405941b8dd871e2a891de90b815632766dd"
---

# PLAN-L7-255: human review bundle の safety field 強化

## 目的

残 frontier は人間判断待ちであり、completion packet は判断材料を見せる surface であって承認や apply を実行する
surface ではない。`humanReviewBundle` は owner / timing / freshness field まで持つようになったが、
dedicated packet 側の plan-only / must-not / allowed=false / approval gate 必須条件を、bundle 上でまとめて
確認する導線がまだ弱かった。

この PLAN では、承認や apply を実行せず、no-apply 境界の確認 field だけを completion packet の
human review item へ追加する。

## 変更

- `humanReviewBundle.items[]` に `safetyReviewFields[]` を追加する。
- safety field は dedicated packet summary の `requiredReviewFields[]` から `schemaVersion.field` として導出する。
- 対象は `planOnly`、`mustNotDecide`、`decisionAllowed`、`mustNotApprove`、`approvalAllowed`、
  `activationReadinessSummary.activationAllowed`、rename approval gate 必須条件など。
- `analyzeCompletionDecisionPacket` は bundle safety field と dedicated packet summary の drift を
  `invalid_human_review_bundle` として fail-close する。
- text mode の `human-review-item:` に `safety-fields=` を出す。

## 採用判断

- 採用: field 名だけを束ねる。承認状態や apply 許可を AI が生成しないため。
- 採用: `schemaVersion.field` 形式にする。S4 / version-up / rename / action-binding の同名 safety field を区別できるため。
- 不採用: apply authorization field を top-level に追加する。completion packet は承認実行 surface ではないため。

## 完了条件

- completion decision packet JSON の各 human review item が safety review fields を返す。
- text mode が `safety-fields=` を表示する。
- bundle safety field が dedicated packet summary と drift したら lint violation になる。
- targeted tests、typecheck、smoke、plan lint、doctor が green。
