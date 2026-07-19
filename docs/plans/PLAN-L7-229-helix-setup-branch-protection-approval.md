---
plan_id: PLAN-L7-229-helix-setup-branch-protection-approval
title: "PLAN-L7-229 (troubleshoot): setup branch protection 外部適用封鎖"
kind: troubleshoot
layer: L7
drive: be
status: confirmed
created: 2026-07-02
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "PO 指摘により branch protection bootstrap を rulesets / release / tag / repository rename と同じ action-binding approval 境界に置く過剰制限を是正する。本 slice は legacy setup、HELIX project setup、生成 script の branch protection apply surface を gh auth/admin preflight 境界へ揃える troubleshoot であり、新しい GitHub API contract は追加しない。"
owner: TL (Codex)
parent_design: docs/design/harness/L6-function-design/setup-solo-team.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
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
    scope: "`helix setup --apply-branch-protection` / `helix setup project --apply-branch-protection` / 生成 `setup-branch-protection.sh` が gh auth/admin preflight 通過時に GitHub branch protection / required status checks の remote mutation へ到達できるよう、過剰な action-binding approval record 必須条件を撤去。L6 setup 設計、L7 U-SETUP oracle、実装、生成 template を同じ意味に揃えた。"
    worker_model: gpt-5.5
    reviewer_model: gpt-5.5
    green_commands:
      - kind: unit_test
        command: "npm test"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T05:24:50+09:00"
        evidence_path: tests/setup.test.ts
        output_digest: "sha256:a9809158f2f241c7ca8a9590734efc91973bb95e86c7586dc65bd93965b5217a"
      - kind: typecheck
        command: "npm run typecheck"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T05:17:42+09:00"
        evidence_path: src/setup/index.ts
        output_digest: "sha256:5f14813617ad12cf42c7a54401f51c898686df675662e0873d72555867a50453"
      - kind: lint
        command: "npm run lint"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T05:18:41+09:00"
        evidence_path: src/setup/templates.ts
        output_digest: "sha256:857cd0b45e0ba4828e2a9f18f1ce60f458a321b460be48da190f2364931c2e69"
      - kind: doctor
        command: "npx --no-install tsx src/cli.ts doctor"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-07-02T05:19:21+09:00"
        evidence_path: docs/design/harness/L6-function-design/setup-solo-team.md
        output_digest: "sha256:63cee00c59e893603f2fe01c0246bb14e48787181b97eee5194d7bbb68a08501"
---

# PLAN-L7-229: setup branch protection 外部適用封鎖

## 0. 目的

`helix setup` / `helix setup project` は GitHub workflow / branch protection / required status checks を
計画・生成物として提示する。通常 GitHub 運用を AI agent が安全に進められるよう、branch protection の
実適用は action-binding approval record ではなく、明示 apply と `gh` 認証/admin preflight で制御する。

既存 `runHelixProjectSetup` は既に plan-only に塞いだが、legacy `runSetup` の `applyBranchProtection` と
生成される `setup-branch-protection.sh` / built-in fallback は、対話 session、admin 権限、confirm が揃うと
`gh api -X PUT` へ到達する余地が残っていた。2026-07-06 の PO 指摘により、branch protection bootstrap まで
action-binding approval record 必須にするのは GitHub 運用を過剰に止める UT ハーネス由来の名残として是正する。
rulesets / release / tag / repository rename / force-push などの高影響境界は引き続き別 approval 境界に残す。

## 1. 実装

> 2026-07-06 追補: PO 指摘「GitHub 運用が自由にできないのは問題。UT ハーネスの名残なら改変対象」を受け、
> `HELIX_BRANCH_PROTECTION_APPROVAL_RECORD` evidence contract を撤去する。branch protection bootstrap は
> 明示 `--apply-branch-protection` + `gh auth status` + repository admin 権限で解錠し、通常 GitHub 運用を
> action-binding approval record 必須に戻さない。

- `applyBranchProtection` は `apply=false` では emit-only、`apply=true` では gh auth と repository admin 権限の preflight に進む。
- dry-run は従来どおり `{applied:false, reason:"dry-run"}` を返す。
- non-dry かつ `applyBranchProtection=false` は `{applied:false, reason:"emit-only"}` を返す。
- non-dry かつ `applyBranchProtection=true` で gh auth が無ければ `{applied:false, reason:"gh-auth-required"}`、admin 権限が無ければ `{applied:false, reason:"admin-permission-required"}` を返す。
- non-dry かつ `applyBranchProtection=true` で gh auth/admin が揃えば `gh auth status` と `gh api -X PUT` に進み、`harness-check` required status を設定する。
- `docs/templates/github/team/setup-branch-protection.sh` と built-in fallback は gh preflight 付き apply-capable script とし、token/secret を保存しない。
- `src/cli.ts` の `--apply-branch-protection` 説明も gh preflight 後の適用に合わせる。

## 2. 公式 source 確認

2026-07-02 に GitHub 公式 docs を確認した。branch protection や required status checks は repository workflow と
merge gate を変える設定であり、admin / owner 権限を要するため、HELIX project setup の初回 bootstrap から
gh auth/admin preflight なしに適用しない方針と整合する。

- GitHub REST API protected branches は、保護 branch 設定の API surface と admin 権限境界の確認に使った。
- GitHub protected branches / branch protection rule は、branch protection が repository workflow を変える設定であることの確認に使った。
- GitHub required status checks は、required check が merge gate になることの確認に使った。

## 3. 受入条件

- [x] `runHelixProjectSetup --apply-branch-protection` は gh auth/admin preflight 通過時だけ `gh api -X PUT` を呼ぶ。
- [x] legacy `runSetup --apply-branch-protection` も gh auth/admin preflight 通過時だけ remote apply へ進む。
- [x] result は preflight 失敗時に reason 付き fail-close を返し、`githubPlan` は default emit-only だが `applyCommandAvailable=true` を返す。
- [x] 生成 branch protection script と built-in fallback は gh preflight apply-capable で、token/secret を保存しない。
- [x] L6 design / L7 test-design に U-SETUP-006 / U-SETUP-007 / U-SETUP-021 / U-SETUP-022 として現行境界を登録する。
- [x] `HELIX_BRANCH_PROTECTION_APPROVAL_RECORD` を branch protection bootstrap の unlock 条件から外し、gh preflight / PUT へ到達できる。通常 GitHub 運用を action-binding approval record 必須へ戻さない。
