---
plan_id: PLAN-L7-229-helix-setup-branch-protection-approval
title: "PLAN-L7-229 (troubleshoot): setup branch protection 外部適用封鎖"
kind: troubleshoot
layer: L7
drive: be
status: confirmed
created: 2026-07-02
updated: 2026-07-02
backprop_decision: not_required
backprop_decision_reason: "L1 は branch protection / rulesets / 外部 API 設定の apply に action-binding approval を必須化している。本 slice は legacy setup、HELIX project setup、生成 script の branch protection apply surface を同じ意味に揃える troubleshoot であり、新しい GitHub API contract は追加しない。"
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
  - artifact_path: src/setup/templates.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: docs/templates/github/team/setup-branch-protection.sh
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
    reviewed_at: "2026-07-02T05:24:58+09:00"
    tests_green_at: "2026-07-02T05:24:50+09:00"
    verdict: pass
    scope: "`ut-tdd setup --apply-branch-protection` / `ut-tdd setup project --apply-branch-protection` / 生成 `setup-branch-protection.sh` が action-binding approval なしに GitHub branch protection / required status checks の remote mutation へ到達し得る穴を封鎖。L1 HNFR-P8 / HNFR-AC、L6 setup 設計、L7 U-SETUP oracle、実装、生成 template を同じ意味に揃えた。"
    worker_model: gpt-5.5
    reviewer_model: gpt-5.5
    green_commands:
      - kind: unit_test
        command: "bun run test"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T05:24:50+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:a9809158f2f241c7ca8a9590734efc91973bb95e86c7586dc65bd93965b5217a"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T05:17:42+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:5f14813617ad12cf42c7a54401f51c898686df675662e0873d72555867a50453"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T05:18:41+09:00"
        evidence_path: src/setup/templates.ts
        output_digest: "sha256:857cd0b45e0ba4828e2a9f18f1ce60f458a321b460be48da190f2364931c2e69"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T05:19:21+09:00"
        evidence_path: docs/design/harness/L6-function-design/setup-solo-team.md
        output_digest: "sha256:63cee00c59e893603f2fe01c0246bb14e48787181b97eee5194d7bbb68a08501"
---

# PLAN-L7-229: setup branch protection 外部適用封鎖

## 0. 目的

`ut-tdd setup` / `ut-tdd setup project` は GitHub workflow / branch protection / required status checks を
計画・生成物として提示するが、外部 GitHub 設定の実適用権限は action-binding approval なしに持たない。

既存 `runHelixProjectSetup` は既に plan-only に塞いだが、legacy `runSetup` の `applyBranchProtection` と
生成される `setup-branch-protection.sh` / built-in fallback は、対話 session、admin 権限、confirm が揃うと
`gh api -X PUT` へ到達する余地が残っていた。これは L1 HNFR-P8 / HNFR-AC の
「branch protection/rulesets/secrets/外部 API 設定など本番・外部影響を持つ適用は action-binding approval 必須」
という意味とずれる。

## 1. 実装

- `applyBranchProtection` は action-binding approval 入力が無い現行 setup では remote API へ進ませない。
- dry-run は従来どおり `{applied:false, reason:"dry-run"}` を返す。
- non-dry かつ `applyBranchProtection=false` は `{applied:false, reason:"emit-only"}` を返す。
- non-dry かつ `applyBranchProtection=true` で非対話なら `{applied:false, reason:"non-interactive"}` を返す。
- non-dry かつ `applyBranchProtection=true` で対話/admin/confirm 相当が揃っても `{applied:false, reason:"action-binding-approval-required"}` を返し、
  `gh auth status` や `gh api -X PUT` に進まない。
- `docs/templates/github/team/setup-branch-protection.sh` と built-in fallback は実適用 script ではなく approval checklist にし、
  `gh api -X PUT` / `/branches/main/protection` の mutating endpoint を含めず `exit 2` する。
- `src/cli.ts` の `--apply-branch-protection` 説明も「適用」ではなく approval required stop に合わせる。

action_binding_approval_record:
- allowed_outcome: `approve_action_binding` / `deny_action` / `request_scope_reduction`
- approval_policy_or_named_approver: PO の human approval / action-binding approval は、HELIX project setup が GitHub branch protection や required status checks を適用する前に必須。
- approval_scope: この PLAN は `ut-tdd setup --apply-branch-protection` / `ut-tdd setup project --apply-branch-protection` / 生成 `setup-branch-protection.sh` の remote GitHub branch protection apply を拒否する範囲に限定する。
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
- [x] legacy `runSetup --apply-branch-protection` は対話 / admin / confirm が揃っていても `gh auth status` / `gh api -X PUT` を呼ばない。
- [x] result は `action-binding-approval-required` を返し、`githubPlan` は plan-only のまま。
- [x] 生成 branch protection script と built-in fallback は approval checklist のみで、mutating endpoint を含まない。
- [x] L6 design / L7 test-design に U-SETUP-006 / U-SETUP-007 / U-SETUP-021 / U-SETUP-022 として境界を登録する。
