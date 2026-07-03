---
plan_id: PLAN-L7-290-setup-project-rollback-command
title: "PLAN-L7-290: setup project rollback command surface 固定"
kind: impl
layer: L7
drive: agent
status: confirmed
created: 2026-07-03
updated: 2026-07-03
backprop_decision: not_required
backprop_decision_reason: "consumer readiness の rollback command surface を正規 setup project 入口へ揃える小変更。CLI 互換面、D-API/D-DB、認証/secret、不可逆 migration は変更しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: tests/setup.test.ts
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - setup project rollback command 固定"
  - role: qa
    slot_label: "QA - consumer readiness rollback 回帰"
generates:
  - artifact_path: docs/plans/PLAN-L7-290-setup-project-rollback-command.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-03-setup-solo-team.md
  requires:
    - docs/plans/PLAN-L7-03-setup-solo-team.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-03T23:05:00+09:00"
    tests_green_at: "2026-07-03T23:05:00+09:00"
    verdict: approve
    scope: "consumer readiness の rollback commands が旧 `ut-tdd setup` 入口ではなく、HELIX project bootstrap の正規入口 `ut-tdd setup project` を返すことを固定する。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/setup.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T23:05:00+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:2f70ab40feedf1212ac579b796585383e02863c18e4124f2b124c7653bdb84a6"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-03T23:05:00+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bun run src/cli.ts plan lint --gate governance"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-03T23:05:00+09:00"
        evidence_path: docs/plans/PLAN-L7-290-setup-project-rollback-command.md
        output_digest: "sha256:f2d2a094de848ca749a6cf6dcf91174704d14c876ae1a957f1cf7647b2af7bd6"
---

## 目的

`ut-tdd setup project` が HELIX project bootstrap の正規入口であるにもかかわらず、`ConsumerReadinessPlan.rollback.commands` が旧 solo/team adapter 入口の `ut-tdd setup --dry-run` / `ut-tdd setup --solo` を返していた。これは新規プロジェクト導入後の復旧導線だけが正規 workflow から外れる意味ズレであり、初回稼働証跡と rollback 手順の対応を弱くする。

この PLAN では rollback command surface を `ut-tdd setup project --dry-run --json` と `ut-tdd setup project --solo` に揃え、旧入口が consumer readiness に戻った場合に unit test で fail-close する。

## DoD

- [x] `ConsumerReadinessPlan.rollback.commands` が `setup project` 入口を返す。
- [x] 旧 `ut-tdd setup --dry-run` / `ut-tdd setup --solo` が rollback commands に混入しないことを test で固定する。
- [x] PLAN-M-02 の `.ut-tdd -> .helix` cutover、branch protection apply、secret / PII / external API apply は実行しない。
