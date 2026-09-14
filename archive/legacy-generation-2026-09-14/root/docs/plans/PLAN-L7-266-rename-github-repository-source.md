---
plan_id: PLAN-L7-266-rename-github-repository-source
title: "PLAN-L7-266: rename cutover GitHub repository source binding"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "PLAN-M-02 の不可逆 cutover は維持し、承認前 rename packet の公式 source 束縛だけを強化する小変更。"
owner: TL (Codex)
parent_design: docs/process/forward/L08-L14-verification-phase.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "explorer - rename cutover source gap audit"
  - role: tl
    slot_label: "TL - packet/test/doc implementation"
generates:
  - artifact_path: docs/plans/PLAN-L7-266-rename-github-repository-source.md
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
  - artifact_path: tests/identifier-rename.test.ts
    artifact_type: test_code
  - artifact_path: tests/cutover-readiness.test.ts
    artifact_type: test_code
  - artifact_path: tests/outstanding.test.ts
    artifact_type: test_code
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
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
    reviewed_at: "2026-07-03T15:00:16+09:00"
    tests_green_at: "2026-07-03T15:00:16+09:00"
    verdict: approve
    scope: "GitHub repository rename の公式 redirect / Pages 例外 / git remote update 観点を PLAN-M-02 承認前 rename packet の source ledger、runbook、verification matrix に接続する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/identifier-rename.test.ts tests/cutover-readiness.test.ts tests/outstanding.test.ts tests/completion-decision-packet.test.ts tests/cli-surface.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T15:00:16+09:00"
        evidence_path: tests/identifier-rename.test.ts
        output_digest: "sha256:b4a3f6e38288c21e06cefc2b782620e639d898663a77a228bd3bd252c3f8c7b0"
      - kind: typecheck
        command: "bun run tsc --noEmit"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T15:00:16+09:00"
        evidence_path: src/lint/identifier-rename.ts
        output_digest: "sha256:2b75560f97b74b5b8b4af3952a18a6b2bfbd7540d5d8b9ffee014cb5d90ee870"
---

# PLAN-L7-266: rename cutover GitHub repository source 束縛

## 目的

PLAN-M-02 は `.helix` から HELIX への不可逆 cutover を承認待ちにしている。既存 packet は
GitHub approval / concurrency、rollback、provenance、backup を扱っていたが、GitHub repository rename の
redirect と project site URL 例外を公式 source row として直接束縛していなかった。

この PLAN は、repo/package/docs distribution surface を含む cutover 判断で GitHub repository rename の
公式前提を承認者が見落とさないようにする。

## 変更

- Cutover source ledger に `GitHub repository rename` row を追加する。
- `helix rename plan --json` の `verificationCommandMatrix[]` に `repository-redirect-review` を追加する。
- `cutoverRunbook[]` に repository redirect / remote update / Pages 例外 / distribution reference review の no-write step を追加する。
- expected matrix count と test fixtures を 10 row / 7 source rows へ更新する。
- U-DECISIONREC-011 に repository redirect review の oracle を追記する。

## 境界

- GitHub repo rename、package rename、remote URL 変更、Pages 設定変更は実行しない。
- redirect があることを HELIX CLI/bin、state dir、consumer template、package/bin alias の改名承認に読み替えない。
- PLAN-M-02 の approval / action-binding / cutover decision blocker は維持する。

## 完了条件

- rename packet が GitHub repository rename source を必須 source ledger として扱う。
- runbook / verification matrix が repository redirect / Pages 例外 / remote update review を no-write evidence として出す。
- summary の matrix count が 10 row に一致する。
- targeted tests、typecheck、design-language、plan governance、doctor が green。
