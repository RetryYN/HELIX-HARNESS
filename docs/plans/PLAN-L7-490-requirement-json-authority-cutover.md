---
plan_id: PLAN-L7-490-requirement-json-authority-cutover
title: "PLAN-L7-490 (add-impl): Requirement JSON authority cutover"
kind: add-impl
layer: L7
drive: agent
status: confirmed
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-30T23:28:23Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-07-30T23:28:23Z"
    evidence_digest: "sha256:be6551d309cb263fe2470d4f4f18041484a373caf7bc4ca692c704a6de6de113"
  entries: []
entry_signals:
  - "po_directive:2026-07-30 PR-5 JSON canonical cutover"
created: 2026-07-30
updated: 2026-07-31
owner: Codex / TL
github_issue_id: 287
engineering_discipline_required: true
behavior_contract_id: REQUIREMENT-JSON-AUTHORITY-CUTOVER
responsibility_owner: requirement-json-authority
change_slice: atomic
refactor_step: remove_legacy
legacy_retirement_state: consumer_zero
no_code_decision: modify
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-91がcanonical／generated／compatibility／DB切替をpair freezeする"
contract_postconditions: "canonical JSON、generated view、requirement_ir DB、既存doctor authority gateが同一rootへ収束する"
contract_invariants: "dual authority 0、legacy semantic writer 0、旧shadow DB/artifact 0、denominator drift 0"
contract_failures: "canonical/view/digest/consumer/table driftをfail-closeする"
tdd_red_required: true
red_at: "2026-07-30T20:01:22Z"
green_at: "2026-07-30T20:01:39Z"
mutation_oracle_evidence: "tests/requirement-authority.test.ts U-RAC-002bへconsumer_policy.dual_authorityをforbiddenからallowedへ変えるseeded mutationを注入し、authoritySchemaがfailed/redとして拒否してmutationをkilledする。U-RAC-001〜006のcanonical JSON、generated view、compatibility digest、legacy consumer、retired shadow table oracleと合わせてdual authorityをfail-closeする"
complexity_effect: net_negative
complexity_justification: "shadow loaderをmigration-onlyへ隔離し、canonical loaderと既存doctor責務へ収束する"
removal_trigger: "恒久authority contractのためなし。migration compilerはcompatibility consumer 0で削除する"
parent_design: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md
pair_artifact: docs/test-design/helix/L8-requirement-json-authority-cutover-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE — canonical loader／projection／retirement"
  - role: qa
    slot_label: "QA — authority driftとnegative oracle"
  - role: tl
    slot_label: "TL — atomic cutover judgement"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md, oracle_id: U-RAC-001, test_path: tests/requirement-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md, oracle_id: U-RAC-002, test_path: tests/requirement-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md, oracle_id: U-RAC-003, test_path: tests/requirement-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md, oracle_id: U-RAC-004, test_path: tests/requirement-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md, oracle_id: U-RAC-005, test_path: tests/requirement-authority.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md, oracle_id: U-RAC-006, test_path: tests/requirement-authority.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-490-requirement-json-authority-cutover.md, artifact_type: markdown_doc }
  - { artifact_path: config/requirement-ir-authority.json, artifact_type: json_config }
  - { artifact_path: config/requirement-ir-schema.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/manifest.json, artifact_type: json_config }
  - { artifact_path: src/requirements/requirement-authority.ts, artifact_type: source_module }
  - { artifact_path: src/requirements/requirement-authority-gate.ts, artifact_type: source_module }
  - { artifact_path: src/requirements/requirement-ir-authority-cutover.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-authority.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-91-requirement-json-authority-cutover.md
  requires:
    - docs/plans/PLAN-L6-91-requirement-json-authority-cutover.md
  references:
    - docs/plans/PLAN-L7-488-requirement-ir-shadow-migration.md
    - docs/plans/PLAN-L7-489-requirement-generated-view-projection.md
  blocks:
    - docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-30T23:28:23Z"
    tests_green_at: "2026-07-30T23:40:09Z"
    verdict: approve_after_fixes
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #298 HEAD 1384ca57e9ccb6c207ca573dd62425ff6c8e8311をclean detached worktreeで独立review。前回C-1のauthority consumer drift 7 oracle解消、canonical JSON／generated view／compatibility read-only／requirement_ir v41／shadow retirement／Design Template接続口、mutation kill、DB convergenceを確認した。内容はconfirm可能。残ったC-3 scope宣言はPR本文へ7 pathとscope expansion receiptを追加して解消済み。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/298#issuecomment-5137316684"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/requirement-authority.test.ts tests/requirement-generated-view.test.ts tests/requirement-generated-view-db.test.ts tests/requirement-ir-shadow.test.ts tests/infinity-loop-strict-design-contract.test.ts tests/l12-hybrid-recognition.test.ts tests/goal-evidence-audit.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-30T23:40:09Z", evidence_path: tests/requirement-authority.test.ts, output_digest: "sha256:d982cd0d0b60e7a42109307ca11ec09c88c793b8e1b20ccc9a064fa9b8358475", result: "72/72 pass" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-07-30T23:40:09Z", evidence_path: src/requirements/requirement-authority.ts, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", result: "exit 0" }
---

# PLAN-L7-490: Requirement JSON authority切替

## §工程表

1. Red: generated view、compatibility digest、legacy consumer、shadow table残存の反例を固定する。
2. Green: canonical loader、authority packet、既存doctor統合、v41 projectionを最小実装する。
3. Refactor: shadow generatorをmigration-onlyへ隔離し、dual authority surfaceを削除する。

## §closure

PLAN-L6-91 pair freeze、U-RAC-001..006、typecheck、full CI、DB convergenceの成立と、
authoring runtimeと異なるAI-B reviewを同一HEADへ束縛した場合だけconfirmedへ遷移する。
