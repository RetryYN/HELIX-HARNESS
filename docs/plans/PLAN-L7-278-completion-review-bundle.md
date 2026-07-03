---
plan_id: PLAN-L7-278-completion-review-bundle
title: "PLAN-L7-278: completion review-bundle と判断前レビュー束"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "completion claim 前のレビュー束を非破壊に追加する L7 実装。D-API/D-DB、実 rename、approval 記録、cutover apply は行わない。"
owner: TL (Codex)
parent_design: docs/process/forward/L08-L14-verification-phase.md
pair_artifact: tests/outstanding.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - completion authority boundary review"
  - role: qa
    slot_label: "QA - review bundle contract review"
generates:
  - artifact_path: docs/plans/PLAN-L7-278-completion-review-bundle.md
    artifact_type: markdown_doc
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: src/setup/templates.ts
    artifact_type: source_module
  - artifact_path: src/lint/completion-decision-packet.ts
    artifact_type: source_module
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/workflow-decision-packets.ts
    artifact_type: source_module
  - artifact_path: tests/completion-decision-packet.test.ts
    artifact_type: test_code
  - artifact_path: tests/doctor.test.ts
    artifact_type: test_code
  - artifact_path: tests/outstanding.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/process/forward/L08-L14-verification-phase.md
  requires:
    - docs/plans/PLAN-L7-277-rename-approval-draft-packet.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T19:30:00+09:00"
    tests_green_at: "2026-07-03T19:30:00+09:00"
    verdict: approve
    scope: "`ut-tdd completion review-bundle --json` を非判断・非適用のレビュー束として追加し、completion decision packet、S4、version-up、rename、action-binding の supporting packet を scoped command と digest 付きで束ねる。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/outstanding.test.ts tests/cli-surface.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T19:30:00+09:00"
        evidence_path: tests/outstanding.test.ts
        output_digest: "sha256:3d8fbbd5b7208ab9117ad627dfd4f1c1d9fd2b3f7788d857657c29bca4950b8c"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T19:30:00+09:00"
        evidence_path: src/lint/outstanding.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
---

# PLAN-L7-278: completion review-bundle と判断前レビュー束

## 目的

`completion decision-packet` は完了可否の判断項目と human review item を出せる。一方で、S4 判断、version-up activation、rename cutover、action-binding approval の各 supporting packet を「人間判断前に再生成して照合する束」として一括提示する surface が不足していた。

この PLAN では、`ut-tdd completion review-bundle --json` を追加し、完了主張前に確認すべき非破壊 packet、scoped command、安全 field、matrix field、digest を 1 つの束で提示する。判断、承認、適用、state move は行わない。

## 要件

- `completion-review-bundle.v1` は `planOnly=true`、`mustNotDecide=true`、`mustNotApply=true` を固定する。
- `completionClaimAllowed`、`humanDecisionRequired`、`nextAuthority`、`blockedUntil` は `outstanding.completionReadiness` と `completion decision-packet` から派生する。
- `reviewPackets` は各 decision の supporting packet を PLAN scoped command と runnable command 付きで列挙する。
- S4、version-up、rename plan、rename approval-draft、action-binding approval の matrix / safety field が欠けないことをテストで固定する。
- `status --json` / `handover status --json` は `completionReviewBundle` を additive に返す。
- text surface は `completion-review-bundle: ut-tdd completion review-bundle --json` を表示する。
- `completion-review-bundle` は doctor hard gate で `completion decision-packet` と突き合わせ、safety flag、scoped packet、review packet count、digest drift を fail-close する。
- `ut-tdd setup project` の初回導入 contract、VS Code task、consumer CI、escalation workflow、consumer doctor first-run matrix は `completion decision-packet` の直後に `completion review-bundle` を必須証跡として含める。
- 実 cutover、approval 記録、activation、外部実行は行わない。

## 外部確認

- GitHub Actions secure use reference: least privilege と高リスク処理の権限分離を、action-binding review の根拠にする。
- GitHub artifact attestations provenance docs: digest / provenance をレビュー束に含める設計根拠にする。
- OWASP Web Security Testing Guide: セキュリティ検証を判断前レビュー証跡として扱い、実適用とは分離する。

## 受入条件

- `outstanding` tests が review bundle の digest、safety flag、supporting packet の完全性を検証する。
- `cli-surface` tests が JSON/text/status/handover の surface を検証する。
- `completion-decision-packet` tests が review bundle analyzer の OK / safety drift / review packet 欠落 / digest drift を検証する。
- `doctor` tests が review bundle hard gate の実行と missing root fail-close を検証する。
- `setup` tests が新規 VSCode project の初回 verification matrix、CI workflow、task template、consumer doctor profile に review-bundle が伝播することを検証する。
- `typecheck`、`lint`、`plan lint`、`doctor` が成功する。
