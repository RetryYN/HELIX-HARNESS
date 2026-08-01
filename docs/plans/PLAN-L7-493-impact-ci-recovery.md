---
plan_id: PLAN-L7-493-impact-ci-recovery
title: "PLAN-L7-493 (add-impl): Impact CI Recovery"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
completion_claim_allowed: true
entry_signals:
  - "po_directive:2026-08-01 Issue #93 L3Q-IT-024 implementation"
created: 2026-08-01
updated: 2026-08-02
owner: Codex / TL
github_issue_id: 93
engineering_discipline_required: true
behavior_contract_id: GH-AC-017
responsibility_owner: impact-ci-recovery
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-92がpure selectorとprofile dispatchをpair freezeする"
contract_postconditions: "Draft selected／candidate full／post-merge fullが同じinventory contractで実行される"
contract_invariants: "unknown/high-risk full、exact partition、required gate非縮退、receipt exact HEAD"
contract_failures: "selector／inventory／partition／receipt／workflow driftをfail-closeする"
tdd_red_required: true
red_at: "2026-08-01T13:52:41Z"
green_at: "2026-08-01T13:53:58Z"
mutation_oracle_evidence: "tests/impact-ci.test.tsとtests/harness-check-workflow.test.tsでduplicate inventory、workflow／unknown pathのknown-low化、result欠落、terminal二重登録、soft-pass、empty selection、snapshot re-read欠落のseeded mutationを注入すると各oracleがredとなり、欠陥をkilledする"
complexity_effect: net_neutral
complexity_justification: "単一pure moduleと既存CLI/workflow接続だけを追加しrunnerを増やさない"
removal_trigger: "恒久profile契約のためなし。unconditional PR full stepはdual-green後に削除する"
parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-IMPACTCI-001, test_path: tests/impact-ci.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-IMPACTCI-012, test_path: tests/impact-ci.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/impact-ci-recovery.md, oracle_id: U-IMPACTCI-WF-001, test_path: tests/harness-check-workflow.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — pure selector／CLI／workflow実装" }
  - { role: qa, slot_label: "QA — impact selection／receipt／workflow mutation oracle" }
  - { role: tl, slot_label: "TL — full admission非縮退とscope監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-493-impact-ci-recovery.md, artifact_type: markdown_doc }
  - { artifact_path: src/runtime/impact-ci.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: yaml_config }
  - { artifact_path: tests/impact-ci.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-92-impact-ci-recovery.md
  requires:
    - docs/plans/PLAN-L6-92-impact-ci-recovery.md
    - docs/plans/PLAN-L5-84-impact-ci-recovery.md
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-01T15:25:14Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-01T15:25:14Z"
    evidence_digest: "sha256:de766ed0879f08c8af9a2baaea5f5d6c6b5b8a34e5a0cd9574f49da1460a8bb9"
  entries: []
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-01T15:25:14Z"
    tests_green_at: "2026-08-01T15:18:40Z"
    verdict: approve_after_fixes
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #333 HEAD 380cdd81bb0be1c82ab184d40f9107bc6746f4dfを独立read-only review。selector実装、CLI、workflow dispatch、U-IMPACTCI-001〜012／003B、stale snapshot拒否、Ready／main full admissionを確認しcontent Critical／High／Medium 0。最終HEAD full CIとDB convergenceはconfirm後に取得する。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/333#issuecomment-5152067607"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/impact-ci.test.ts tests/harness-check-workflow.test.ts tests/impact-ci-recovery-detail-design.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-01T15:18:40Z", evidence_path: tests/impact-ci.test.ts, output_digest: "sha256:30629190c3b30152642b10b613ee6d3672d1dbbf08e034433e2bb45d3b5e7525", result: "3 files / 44 tests pass" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-08-01T15:18:40Z", evidence_path: src/runtime/impact-ci.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
---

# PLAN-L7-493: Impact CI Recovery

1. Red: U-IMPACTCI-001〜012とU-IMPACTCI-003B、workflow profile反例を固定する。
2. Green: pure selector、CLI JSON projection、既存workflow dispatchを最小実装する。
3. Refactor: canonical化とfailure codeを一箇所へ集約し、full suite commandを複製しない。
