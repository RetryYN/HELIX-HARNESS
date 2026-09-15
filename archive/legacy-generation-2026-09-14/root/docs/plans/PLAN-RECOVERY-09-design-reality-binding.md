---
plan_id: PLAN-RECOVERY-09-design-reality-binding
title: "PLAN-RECOVERY-09: Design Reality Binding"
kind: recovery
layer: cross
drive: agent
status: confirmed
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-03 PR #355で発見した設計と実在source／failure reachabilityの乖離を再発防止する"
created: 2026-08-03
updated: 2026-08-03
owner: Codex / TL
github_issue_id: 356
parent_design: docs/design/helix/L6-function-design/design-reality-binding.md
pair_artifact: tests/design-reality-binding.test.ts
engineering_discipline_required: true
behavior_contract_id: DESIGN-REALITY-BINDING-001
responsibility_owner: design-reality-binding
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PR #355がmainへmerge済みで、current L4/L5、PLAN lint、doctor、TypeScript AST基盤が実在する"
contract_postconditions: "confirmed L4/L5のruntime claimとfailure reasonがexact HEADの実在source、digest、実行oracle、mutation witnessへ束縛される"
contract_invariants: "新service、DB table、workflow、別ledgerを追加せず、1 behavior contract／1 responsibility ownerを維持する"
contract_failures: "missing symbol、stale digest、planned/compatibility誤昇格、別HEAD、prose-only oracle、到達不能failureをfail-closeする"
tdd_red_required: true
red_at: "2026-08-03T05:23:00Z"
green_at: "2026-08-03T05:57:30Z"
mutation_oracle_evidence: "tests/design-reality-binding.test.tsのU-DRB-011がworker-descriptor-admission.tsの6 failure branchを一時mutant moduleへ実際に置換し、U-WDA-002/003/004/005をchild Vitestで実行して全mutationをkillしnon-zero Redを確認する"
complexity_effect: net_negative
complexity_justification: "既存PLAN lint／doctor／TypeScript解析へ純粋解析器を合成し、reviewや文字列一致だけで実在性を代替する手戻りを除去する"
removal_trigger: "not_applicable: current design admissionの恒久invariantでありcompatibility layerを追加しない"
irreversible_impact: none
agent_slots:
  - { role: aim, slot_label: "AIM — exact HEAD runtime asset binding" }
  - { role: qa, slot_label: "QA — failure reachability／mutation oracle" }
  - { role: tl, slot_label: "TL — PLAN lint／doctor統合とFeature #92復帰" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-09-design-reality-binding.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/design-reality-binding.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/design-reality-binding.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/design-reality-binding.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-design-reality-binding-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-design-reality-binding-function-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L9-design-reality-binding-system-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/design-reality-binding.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/worker-descriptor-admission.ts, artifact_type: source_module }
  - { artifact_path: src/plan/lint.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: tests/design-reality-binding.test.ts, artifact_type: test_code }
  - { artifact_path: tests/worker-descriptor-admission-detail-design.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-descriptor-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/worker-descriptor-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
dependencies:
  parent: docs/plans/PLAN-RECOVERY-08-requirements-compatibility-isolation.md
  requires:
    - docs/plans/PLAN-L4-60-worker-descriptor-admission.md
    - docs/plans/PLAN-L5-86-worker-descriptor-admission.md
    - src/runtime/worker-descriptor-admission.ts
    - tests/worker-descriptor-admission.test.ts
  blocks:
    - issue:225
review_evidence:
  - reviewer: codex-terra-design-reality-auditor
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-03T06:33:00+09:00"
    tests_green_at: "2026-08-03T06:32:34+09:00"
    verdict: approve
    scope: "HEAD a23d5fdec666d859778c0eb0f0b487a8b835bcce／tree 79e3cb0e5f685a9448436964e6d1f7c02683061cのruntime asset classification、exact source binding、failure reachability、6 branch mutation runner、Recovery source PLAN admission、L6/L8 pair、PLAN lint／doctor統合を別clean worktreeでread-only監査し、Critical／High／Medium 0を確認した。"
    worker_model: gpt-5.6-sol
    reviewer_model: gpt-5.6-terra
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run tests/design-reality-binding.test.ts tests/worker-descriptor-admission.test.ts tests/worker-descriptor-admission-detail-design.test.ts tests/change-impact.test.ts tests/coding-rules.test.ts tests/ddd-tdd-rules.test.ts tests/digest.test.ts tests/l12-hybrid-recognition.test.ts --reporter=dot"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-03T06:32:34+09:00"
        evidence_path: tests/design-reality-binding.test.ts
        output_digest: "sha256:72ac0713b61ad0bc73a0de99aa9a499bc0c62e66b90a92c26415763b6f3651b8"
        result: "103/103 pass"
      - kind: lint
        command: "npx --no-install tsx src/cli.ts plan lint"
        runner: node
        scope: gate
        exit_code: 0
        completed_at: "2026-08-03T06:32:34+09:00"
        evidence_path: src/lint/design-reality-binding.ts
        output_digest: "sha256:ea44dbe42335234ca6108eda6126c045b1e075184d032fa606d3e34b5b6b8e81"
        result: "schedule, descent, V-pair, reality, routing green"
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-03T06:32:34+09:00"
        evidence_path: src/lint/design-reality-binding.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        result: "exit 0"
      - kind: lint
        command: "npx --no-install biome check src/lint/change-impact.ts src/lint/design-reality-binding.ts src/lint/l12-hybrid-reviewed-safe-v2.ts src/lint/l3-progression-reviewed-digests.ts src/plan/lint.ts src/runtime/worker-descriptor-admission.ts tests/change-impact.test.ts tests/design-reality-binding.test.ts tests/l12-hybrid-recognition.test.ts tests/worker-descriptor-admission-detail-design.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-03T06:32:34+09:00"
        evidence_path: src/lint/design-reality-binding.ts
        output_digest: "sha256:26b02387d9f5407126426fefc177ebfefd6caddea5e26d71f08f3f4fca18349b"
        result: "10 files clean"
---

# PLAN-RECOVERY-09: 設計実在性束縛

## §工程表

### Step 1: reality inventory [直列]

- PR #355の旧claimとexact HEADのexport、type、test oracleを照合する。
- runtime assetを`existing_runtime`、`planned_new`、`compatibility_only`へ分類する。

### Step 2: pure analyzer [直列]

- source path、export、digest、current authorityとplanned／compatibility境界を検査する。
- identity解決とpost-resolution checkを意味実行し、failure到達性とmutation Redを検査する。

### Step 3: admission integration [直列]

- 同じ解析器を既存PLAN lintの既定合成とdoctorへ接続する。
- confirmed L4/L5のactivation境界とPR #355回帰bindingを閉じる。

### Step 4: independent convergence [直列]

- targeted、typecheck、Biome、PLAN governance、doctorをgreen化する。
- full CI、Windows durability、DB convergence、独立AI-B exact-HEAD reviewを一巡しmergeする。

## §1 受入条件

- AC-1: 存在しない`PythonWorkerRegistry`をexisting runtimeとして受理しない。
- AC-2: planned／compatibility assetをcurrent implementation completionへ昇格できない。
- AC-3: `agent_id + contract_version + capability_class` identityでcapability mismatchが到達不能なら拒否する。
- AC-4: identity解決後にcapabilityを別検証する現行WCC設計はgreenになる。
- AC-5: executable oracle、reason assertion、mutation witnessのいずれかが欠ければfail-closeする。
- AC-6: 新service、DB table、workflow、別ledgerを追加しない。

## §2 検証コマンド

- `npx --no-install vitest run tests/design-reality-binding.test.ts tests/worker-descriptor-admission.test.ts`
- `npx --no-install tsx src/cli.ts plan lint --gate design-reality-binding`
- `npx --no-install tsc --noEmit --pretty false`
- `npx --no-install biome check <changed paths>`
- `npx --no-install tsx src/cli.ts doctor`
