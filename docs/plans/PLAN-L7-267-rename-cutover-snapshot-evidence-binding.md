---
plan_id: PLAN-L7-267-rename-cutover-snapshot-evidence-binding
title: "PLAN-L7-267: rename cutover snapshot evidence binding"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "PLAN-M-02 の不可逆 cutover は維持し、承認前 rename packet の snapshot 束縛を強化する小変更。"
owner: TL (Codex)
parent_design: docs/process/forward/L08-L14-verification-phase.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - snapshot evidence binding implementation"
generates:
  - artifact_path: docs/plans/PLAN-L7-267-rename-cutover-snapshot-evidence-binding.md
    artifact_type: markdown_doc
  - artifact_path: docs/process/forward/L08-L14-verification-phase.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/identifier-rename.ts
    artifact_type: source_module
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/completion-decision-packet.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/identifier-rename.test.ts
    artifact_type: test_code
  - artifact_path: tests/outstanding.test.ts
    artifact_type: test_code
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/process/forward/L08-L14-verification-phase.md
  requires:
    - docs/test-design/harness/L7-unit-test-design.md
    - src/lint/identifier-rename.ts
    - tests/identifier-rename.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T16:10:00+09:00"
    tests_green_at: "2026-07-03T16:10:00+09:00"
    verdict: approve
    scope: "PLAN-M-02 の rename cutover snapshot を clean worktree status と evidence artifact 実 hash に束縛し、snapshot ID だけ一致する承認を ready 扱いにしない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "npm test tests/identifier-rename.test.ts tests/outstanding.test.ts tests/completion-decision-packet.test.ts --timeout 300000"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T16:10:00+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:fbe493a2848c4546a81df0635764b3da4dbd7d21c7635a74d9cca8ba0935888c"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T16:10:00+09:00"
        evidence_path: src/lint/identifier-rename.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
---

# PLAN-L7-267: rename cutover snapshot evidence 束縛

## 目的

PLAN-M-02 の不可逆 rename cutover は、current `cutoverSnapshot.snapshotId` と承認 record の一致だけでは
十分ではない。承認時の worktree が dirty のまま、または runbook / restore drill の証跡 artifact が存在しない
ままでも snapshot ID を記録できると、L14 承認前 evidence が弱い。

この PLAN は、rename cutover packet を clean worktree と実 artifact hash に束縛し、証跡のない approval material を
ready 扱いにしない。

## 変更

- `cutoverSnapshot` に worktree status、dirty path count、evidence artifact hash、missing artifact list を追加する。
- `evidenceDigest` と `snapshotId` に clean/dirty 状態と `.helix/evidence/rename/` 配下の artifact hash を含める。
- `approvalMaterialReady=true` は current snapshot 一致に加えて、clean worktree と全 evidence artifact presence を要求する。
- completion/status/handover の supporting summary に worktree / evidence artifact field を追加する。
- text mode に `cutover-snapshot-worktree:` と `cutover-snapshot-evidence:` を追加する。

## 境界

- `.helix` から `.helix` への state move、rename apply、action-binding approval は実行しない。
- 既存の PLAN-M-02 human approval / irreversible cutover blocker は解除しない。
- 証跡 artifact の実生成 command は承認前 packet の要求として扱い、この PLAN では本番 cutover evidence を作らない。

## 完了条件

- dirty worktree または evidence artifact 欠落で `approvalMaterialReady=true` にならない。
- worktree status / evidence artifact hash の変更で `cutoverSnapshot.snapshotId` が変わる。
- status/completion summary から worktree / artifact hash field を確認できる。
- targeted tests、typecheck、doctor が green。
