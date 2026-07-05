---
plan_id: PLAN-L7-258-cutover-evidence-path-gate
title: "PLAN-L7-258: cutover evidence path gate 強化"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "L14 identifier rename cutover の承認前 packet / restore manifest の証跡 path 検証を強化する。不可逆 rename apply、state move、承認記録は行わない。"
owner: TL (Codex)
parent_design: docs/process/forward/L08-L14-verification-phase.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - cutover evidence path gate"
generates:
  - artifact_path: docs/plans/PLAN-L7-258-cutover-evidence-path-gate.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/lint/identifier-rename.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: tests/identifier-rename.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/process/forward/L08-L14-verification-phase.md
  requires:
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/test-design/harness/L7-unit-test-design.md
    - src/lint/identifier-rename.ts
    - src/doctor/index.ts
    - tests/identifier-rename.test.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T13:48:12+09:00"
    tests_green_at: "2026-07-03T13:48:12+09:00"
    verdict: approve
    scope: "L14 identifier rename cutover packet の runbook evidence path と state backup restore manifest を repo-local artifact path に固定し、URL・絶対 path・traversal・prose を承認証跡として通さないようにした。不可逆 rename apply、state move、approval は実行していない。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/identifier-rename.test.ts tests/cutover-readiness.test.ts tests/cli-surface.test.ts --timeout 180000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T13:48:12+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:0a5a7912110898e1fdcf533319ad9ffcc7f5744681f3691c9d7b2d54d62b3512"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T13:48:12+09:00"
        evidence_path: src/lint/identifier-rename.ts
        output_digest: "sha256:af8a388b0552057be7bc31ece782d68a958f10202d7ce13867a0cbdd10ca7b77"
---

# PLAN-L7-258: cutover evidence path gate 強化

## 目的

PLAN-M-02 の L14 identifier rename cutover は、承認前に runbook evidence と state backup restore drill の
証跡 path を確認する。ただし path field が存在していても、URL、絶対 path、`..` traversal、自然文 prose、
prefix 外 path を受け入れると、承認者が repo-local artifact を再現できないまま cutover packet を信用する余地が残る。

この PLAN は、`cutoverRunbook.evidencePath` と `stateBackupManifest.restoreEvidencePath` を
`.helix/evidence/rename/` 配下の repo-local artifact path に固定し、`stateBackupManifest.backupTargetPattern`
も `.helix/backups/rename/<timestamp>/` 配下に限定する。

## 変更

- `identifierRenameRunbookCommandViolations` が runbook command だけでなく `evidencePath` の URL / 絶対 path /
  traversal / prose / prefix 外 path を fail-close する。
- `identifierRenameStateBackupManifestViolations` を追加し、restore evidence path、backup target pattern、
  checksum / restore drill / restore required の true 境界を検査する。
- doctor の cutover-readiness bridge と completion packet bridge に state backup manifest validator を接続する。
- L6 function spec / L7 test design に repo-local evidence path contract を追記する。

## 境界

- `.helix` から `.helix` への実 state move は行わない。
- `rename apply`、action-binding approval、cutover decision record は作成しない。
- 外部 API、secret、PII、本番環境設定、ライセンス判断には触れない。

## 完了条件

- URL / prose / traversal を含む cutover evidence path が test で fail-close する。
- doctor が rename plan の state backup manifest validator も実行する。
- targeted tests、typecheck、plan lint、doctor が green。
