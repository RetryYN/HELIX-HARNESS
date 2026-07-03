---
plan_id: PLAN-L7-254-human-review-owner-timing-fields
title: "PLAN-L7-254: human review bundle の owner/timing/freshness field 強化"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "completion decision packet の humanReviewBundle に判断 record の確認 field を追加する限定強化。PO/S4・version-up・cutover の判断結果は代行しない。"
owner: TL (Codex)
parent_design: docs/plans/PLAN-L7-252-completion-human-review-bundle.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - human review field bundle"
generates:
  - artifact_path: docs/plans/PLAN-L7-254-human-review-owner-timing-fields.md
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
  parent: docs/plans/PLAN-L7-252-completion-human-review-bundle.md
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
    reviewed_at: "2026-07-03T13:10:00+09:00"
    tests_green_at: "2026-07-03T13:10:00+09:00"
    verdict: approve
    scope: "completion decision packet の humanReviewBundle に ownerReviewFields / timingReviewFields / freshnessReviewFields を追加した。各 field は requiredRecords[].fields から recordName.field として導出し、PO が誰・期限・snapshot/source freshness をどの record で確認するかを completion packet だけで辿れるようにした。判断結果や承認 apply は実行していない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/completion-decision-packet.test.ts tests/cli-surface.test.ts tests/outstanding.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T13:10:00+09:00"
        evidence_path: tests/completion-decision-packet.test.ts
        output_digest: "sha256:67780db135eb7eddbf630f2a37ad38b59116147d7f37cb537d850634ec069864"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T13:10:00+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:86cc444a0c16f9036e799f875c967c11190f7c76e9e1b3f3a87ef7e4d7195c1d"
      - kind: smoke
        command: "bun run src/cli.ts completion decision-packet --json; bun run src/cli.ts completion decision-packet | rg \"human-review-(bundle|item)\""
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T13:10:00+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8452c5d46b3bb0206c1019a72a117abdb11c5917803259795d49c0d76b139d7b"
---

# PLAN-L7-254: human review bundle の owner/timing/freshness field 強化

## 目的

残 frontier は PO/S4 判断、action-binding approval、version-up activation、不可逆 cutover signoff である。
`humanReviewBundle` は scoped packet と required record を束ねていたが、承認者が「誰が」「いつまでに」
「どの snapshot/source freshness を見るか」を判断 record から探す必要が残っていた。

この PLAN では判断結果を代行せず、required record の field を completion packet の human review item へ
record 名付きで引き上げる。

## 変更

- `humanReviewBundle.items[]` に `ownerReviewFields[]`、`timingReviewFields[]`、
  `freshnessReviewFields[]` を追加する。
- 各 field は `requiredRecords[].fields` から `recordName.field` として導出する。
- `analyzeCompletionDecisionPacket` は bundle field と required record field の drift を
  `invalid_human_review_bundle` として fail-close する。
- text mode の `human-review-item:` に owner/timing/freshness fields を出す。
- L6/L7 docs と unit/CLI tests を更新する。

## 採用判断

- 採用: field 値ではなく field 名を束ねる。未承認の owner や期限を勝手に決めないため。
- 採用: `recordName.field` 形式にする。複数 record の同名 field を区別できるため。
- 不採用: due date を自動生成する。期限は `review_by_policy` / `expires_at_or_trigger` / cutover record などの人間判断 field に記録されるべきで、AI が補完しない。

## 完了条件

- completion decision packet JSON の各 human review item が owner/timing/freshness review fields を返す。
- text mode が同じ field を `human-review-item:` に表示する。
- bundle field が required record fields と drift したら lint violation になる。
- targeted tests、typecheck、smoke、plan lint、doctor が green。
