---
plan_id: PLAN-L7-277-rename-approval-draft-packet
title: "PLAN-L7-277: rename approval-draft packet と completion decision 連携"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "PLAN-M-02 の不可逆 cutover 承認前レビューを補強する L7 実装。D-API/D-DB、実 rename、state move、approval 代行は行わない。"
owner: TL (Codex)
parent_design: docs/process/forward/L08-L14-verification-phase.md
pair_artifact: tests/identifier-rename.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - cutover approval boundary review"
  - role: qa
    slot_label: "QA - completion packet contract review"
generates:
  - artifact_path: docs/plans/PLAN-L7-277-rename-approval-draft-packet.md
    artifact_type: markdown_doc
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/lint/identifier-rename.ts
    artifact_type: source_module
  - artifact_path: src/lint/workflow-decision-packets.ts
    artifact_type: source_module
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/completion-decision-packet.ts
    artifact_type: source_module
  - artifact_path: tests/identifier-rename.test.ts
    artifact_type: test_code
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/process/forward/L08-L14-verification-phase.md
  requires:
    - docs/plans/PLAN-L7-276-rename-evidence-pack-and-vscode-cutover-source.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T18:35:00+09:00"
    tests_green_at: "2026-07-03T18:35:00+09:00"
    verdict: approve
    scope: "`helix rename approval-draft --json` を非承認・非適用 packet として追加し、PLAN-M-02 の completion decision supporting packet に接続する。primary は `helix rename plan --json` のまま維持し、action-binding approval を authority boundary として残す。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/identifier-rename.test.ts tests/completion-decision-packet.test.ts tests/cli-surface.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T18:35:00+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:ffe3fa53f4dce03b4ee73626be1bcde6707a9d6fcb9980b3e6fd73892f27f0ef"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T18:35:00+09:00"
        evidence_path: src/lint/identifier-rename.ts
        output_digest: "sha256:49f7b92fdbb518b4d54a9bcb9f1f37c983617b0ab51ed00b5025d24f2c148efe"
---

# PLAN-L7-277: rename approval-draft packet と completion decision 連携

## 目的

PLAN-M-02 の `.helix` から `.helix` への rename cutover は、不可逆 migration として人間承認・action-binding approval・clean snapshot・evidence review を要求する。既存の `rename plan` は cutover snapshot と runbook を提示できるが、PO が記録すべき `cutover_decision_record` と `action_binding_approval_record` の草案を snapshot に拘束して提示する surface が不足していた。

この PLAN では、承認を代行しない approval draft packet を追加し、completion decision packet からも確認対象として辿れるようにする。

## 要件

- `helix rename approval-draft --json` は `identifier-rename-approval-draft.v1` を返す。
- packet は `planOnly=true`、`mustNotApply=true`、`approvalCommandAvailable=false`、`approvalAllowed=false`、`applyAuthorized=false` を固定する。
- `currentSnapshot` は `rename plan` の `cutoverSnapshot.snapshotId`、HEAD、dirty path、evidence count、digest、source ledger digest を引き継ぐ。
- `draftRecords` は `cutover_decision_record` と `action_binding_approval_record` の草案を返すが、各 record は `pasteReady=false` と `unsafeToTreatAsApproval=true` を持つ。
- `completion decision-packet` / `handover status` / `status` の supporting packet list は、PLAN-M-02 で `rename plan -> rename approval-draft -> action-binding approval-packet` の順に提示する。
- 実 cutover、state move、alias 有効化、approval の自動記録は行わない。

## 受入条件

- `identifier-rename` tests が approval draft の snapshot binding、安全 flag、CLI JSON/text surface を検証する。
- `completion-decision-packet` tests が approval draft summary の required review fields と欠落時 fail-close を検証する。
- `cli-surface` tests が workflow next action / human review bundle / packet command 表示に approval draft を含むことを検証する。
- `typecheck`、`plan lint`、`doctor` が成功する。
