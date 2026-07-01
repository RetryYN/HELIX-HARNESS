---
plan_id: PLAN-L7-229-helix-setup-branch-protection-approval
title: "PLAN-L7-229 (troubleshoot): HELIX project setup の branch protection 外部適用封鎖"
kind: troubleshoot
layer: L7
drive: be
status: confirmed
created: 2026-07-02
updated: 2026-07-02
backprop_decision: not_required
backprop_decision_reason: "L6 setup 設計は `ut-tdd setup project` の GitHub plan を plan-only / appliesRemote=false / applyCommandAvailable=false と定義済み。本 slice は legacy setup apply path が project setup に混入する実装漏れを塞ぐ troubleshoot であり、新しい product requirement や GitHub API contract は追加しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM - setup 外部適用境界と要求意味の整合確認"
  - role: tl
    slot_label: "TL - HELIX setup branch protection approval boundary"
  - role: qa
    slot_label: "QA - setup project remote mutation regression"
generates:
  - artifact_path: docs/plans/PLAN-L7-229-helix-setup-branch-protection-approval.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/setup-solo-team.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/setup/index.ts
    artifact_type: source_module
  - artifact_path: tests/setup.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L7-03-setup-solo-team.md
  requires:
    - docs/plans/PLAN-REVERSE-04-setup-solo-team.md
    - docs/design/harness/L6-function-design/setup-solo-team.md
    - docs/design/helix/L6-function-design/pillar-function-design.md
    - docs/test-design/harness/L7-unit-test-design.md
review_evidence:
  - reviewer: TL self-review (single-runtime)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-02T05:04:51+09:00"
    tests_green_at: "2026-07-02T05:04:21+09:00"
    verdict: pass
    scope: "`ut-tdd setup project --apply-branch-protection` が human approval / action-binding approval なしに GitHub branch protection / required status checks の remote mutation へ到達し得る穴を封鎖。legacy `ut-tdd setup` の opt-in apply は維持し、HELIX project setup の GitHub plan-only 契約だけを強化した。"
    worker_model: gpt-5.5
    reviewer_model: gpt-5.5
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/setup.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-02T05:04:21+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:01b230144252b8f8a52102a92545e9d1f93a10cc5823f6afc96cf74ad0049f01"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T05:04:21+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:06528c09318454f6d4fbc1fcae142b03d9f2c7088a5194398e2b91c67a1a514b"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T05:04:21+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:150eedc5458a7f2b922c4de5a38943702337449466c6dbbb738ec18d79dd5a32"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T05:04:21+09:00"
        evidence_path: docs/design/harness/L6-function-design/setup-solo-team.md
        output_digest: "sha256:b9bff8f2f80976987bda2af6704981cdf89355a9983f98164b08ed4d8f84c529"
---

# PLAN-L7-229: HELIX project setup の branch protection 外部適用封鎖

## 0. 目的

`ut-tdd setup project` は HELIX 導入済み VSCode で新規 project を始める bootstrap である。GitHub workflow /
branch protection / required status checks は計画・生成物として提示するが、外部 GitHub 設定の実適用権限は持たない。

既存 `runHelixProjectSetup` は legacy `runSetup` と同じ `applyBranchProtection` を呼び得たため、対話 session、
admin 権限、confirm が揃うと `--apply-branch-protection` から `gh api -X PUT` へ到達する余地があった。
これは `githubPlan.planOnly=true` / `appliesRemote=false` / `applyCommandAvailable=false` の意味とずれる。

## 1. 実装

- `runHelixProjectSetup` では branch protection を project setup 専用 decision に分離する。
- dry-run は従来どおり `{applied:false, reason:"dry-run"}` を返す。
- non-dry かつ `applyBranchProtection=false` は `{applied:false, reason:"emit-only"}` を返す。
- non-dry かつ `applyBranchProtection=true` は `{applied:false, reason:"action-binding-approval-required"}` を返し、
  `gh auth status` や `gh api -X PUT` に進まない。
- legacy `ut-tdd setup` の `applyBranchProtection` opt-in path は変更しない。

action_binding_approval_record:
- allowed_outcome: `approve_action_binding` / `deny_action` / `request_scope_reduction`
- approval_policy_or_named_approver: PO の human approval / action-binding approval は、HELIX project setup が GitHub branch protection や required status checks を適用する前に必須。
- approval_scope: この PLAN は `ut-tdd setup project --apply-branch-protection` の remote GitHub branch protection apply を拒否する範囲に限定し、legacy `ut-tdd setup` の opt-in 挙動は対象外。
- approved_actor: この PLAN では actor を承認しない。将来承認では GitHub apply 前に human operator または automation identity を記名する。
- approved_tool: この PLAN では tool を承認しない。将来承認では GitHub apply 前に CLI / script / workflow を記名する。
- approved_target: この PLAN では target を承認しない。将来承認では GitHub apply 前に repository、branch、branch protection rule、required check target を記名する。
- approved_params: この PLAN では params を承認しない。将来承認では GitHub apply 前に command args、required check names、review count、admin enforcement、params hash を記録する。
- review_approval_evidence: GitHub official docs、setup dry-run、risk review、no-secret evidence、rollback route、targeted tests、typecheck、lint、doctor を approval 前に review する。
- reviewed_snapshot_binding: この troubleshoot PLAN では no snapshot が該当する。将来承認では scope review 後に生成した current setup output と action-binding approval packet を引用する。
- expires_at_or_trigger: Trigger-bound。branch、required check name、repository target、actor/tool/params、GitHub source、setup output が変われば approval は失効する。
- audit_record: この PLAN では GitHub branch protection apply を承認・実行しない。将来 apply では approver、action commands、command results、rollback route、incident/backlog route を記録する。

## 2. 公式 source 確認

2026-07-02 に GitHub 公式 docs を確認した。branch protection や required status checks は repository workflow と
merge gate を変える設定であり、admin / owner 権限を要するため、HELIX project setup の初回 bootstrap から
action-binding approval なしに適用しない方針と整合する。

- GitHub REST API protected branches は、保護 branch 設定の API surface と admin 権限境界の確認に使った。
- GitHub protected branches / branch protection rule は、branch protection が repository workflow を変える設定であることの確認に使った。
- GitHub required status checks は、required check が merge gate になることの確認に使った。

## 3. 受入条件

- [x] `runHelixProjectSetup --apply-branch-protection` は対話 / admin / confirm が揃っていても `gh api -X PUT` を呼ばない。
- [x] result は `action-binding-approval-required` を返し、`githubPlan` は plan-only のまま。
- [x] `runSetup` の legacy opt-in apply path は変更しない。
- [x] L6 design / L7 test-design に U-SETUP-021 として境界を登録する。
