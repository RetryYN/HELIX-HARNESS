---
plan_id: PLAN-L7-489-requirement-generated-view-projection
title: "PLAN-L7-489 (add-impl): Requirement generated view／DB shadow projection"
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
  assessed_at: "2026-07-30T21:50:49Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-07-30T21:50:49Z"
    evidence_digest: "sha256:45f215f7646bba712f06ae146ef8d9d8122cbb1c99bf0cbb5c552f5cf91fec38"
  entries: []
entry_signals:
  - "po_directive:2026-07-30 JSON generated viewとharness.db shadow projectionを閉じる"
created: 2026-07-30
updated: 2026-07-30
owner: Codex / TL
github_issue_id: 286
engineering_discipline_required: true
behavior_contract_id: REQUIREMENT-IR-GENERATED-VIEW-PROJECTION
responsibility_owner: requirement-ir-generated-view-projection
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L6-90がloader、round-trip、DB shadow table／projection境界をpair freezeする"
contract_postconditions: "generated view byte再現、normalized root digest一致、manifest存在時のDB 273 row rebuild x2、manifest不在時の0 row互換、stale/orphan 0が成立する"
contract_invariants: "shadow_noncanonical、legacy Markdown current、別DB 0、raw requirement本文のDB複製0"
contract_failures: "path escape、manifest/shard drift、record欠落、canonical過大claim、DB row drift／orphanをfail-closeする"
tdd_red_required: true
red_at: "2026-07-30T16:06:00Z"
green_at: "2026-07-30T16:09:02Z"
mutation_oracle_evidence: "tests/requirement-generated-view.test.ts のU-RGV-004でshard record改変、generated marker除去、repository path escapeを注入し、digest mismatch／record count mismatch／escape拒否で失敗（red）させて各mutationをkillする。tests/requirement-generated-view-db.test.ts のU-RGV-007はowner/oracle LEFT JOIN orphanを0に固定し、U-RGV-008はmanifest不在fixtureの0 row互換を固定する。U-RGV-009はgenerated viewを旧authority候補から除外する。final targeted run U-RGV-001..009はgreen"
complexity_effect: justified_positive
complexity_justification: "pure loader/generator/parser、生成adapter、既存schema v40の1 table／1 indexを追加するが、別DB／service／dependencyを増やさない"
removal_trigger: "PR5 canonical cutover後にshadow固有authority／projectionがcanonical readerへ置換されconsumer 0になった時点"
parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md
pair_artifact: docs/test-design/helix/L8-requirement-generated-view-projection-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, oracle_id: U-RGV-001, test_path: tests/requirement-generated-view.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, oracle_id: U-RGV-002, test_path: tests/requirement-generated-view.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, oracle_id: U-RGV-003, test_path: tests/requirement-generated-view.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, oracle_id: U-RGV-004, test_path: tests/requirement-generated-view.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, oracle_id: U-RGV-005, test_path: tests/requirement-generated-view.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, oracle_id: U-RGV-006, test_path: tests/requirement-generated-view-db.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, oracle_id: U-RGV-007, test_path: tests/requirement-generated-view-db.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, oracle_id: U-RGV-008, test_path: tests/requirement-generated-view-db.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, oracle_id: U-RGV-009, test_path: tests/l12-hybrid-recognition.test.ts }
agent_slots:
  - role: se
    slot_label: "SE — generated view／DB projection実装"
  - role: qa
    slot_label: "QA — semantic round-trip／rebuild x2／orphan mutation"
  - role: tl
    slot_label: "TL — shadow authorityとschema revision独立review"
generates:
  - { artifact_path: docs/plans/PLAN-L7-489-requirement-generated-view-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/generated/requirements/requirement-definition.generated.md, artifact_type: markdown_doc }
  - { artifact_path: src/requirements/requirement-generated-view-generator.ts, artifact_type: source_module }
  - { artifact_path: src/requirements/requirement-generated-view.ts, artifact_type: source_module }
  - { artifact_path: src/requirements/requirement-ir-shadow.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-tables-design.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db-indexes.ts, artifact_type: source_module }
  - { artifact_path: src/schema/harness-db.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-generated-view.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view-db.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-90-requirement-generated-view-projection.md
  requires:
    - docs/plans/PLAN-L6-90-requirement-generated-view-projection.md
  references:
    - generated/requirements-ir/manifest.json
    - docs/plans/PLAN-L7-488-requirement-ir-shadow-migration.md
  blocks:
    - docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-30T21:50:49Z"
    tests_green_at: "2026-07-30T21:50:07Z"
    verdict: approve_after_fixes
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #296 HEAD ea2519a2b65886ce5a20b64096e8ce00b8ded0aaをclean detached worktreeで独立review。generated view／DB shadow projection、manifest不在consumer互換、generated non-authority境界、U-RGV-001..009、所有PLAN／digest台帳を確認した。full fastは3031 pass、残2件はbaseでも再現するNode 24.15配布環境要因でPR起因red 0。終端confirm、counter 21復帰、left-arm carryの同一commit化を要求。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/296#issuecomment-5136631450"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/requirement-generated-view.test.ts tests/requirement-generated-view-db.test.ts tests/fe-roster-orchestration.test.ts tests/plan-descent-specific-parent-binding.test.ts tests/feedback-test-owner-recognition-disposition.test.ts tests/feedback-test-owner-residual-disposition.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-30T21:50:07Z", evidence_path: tests/requirement-generated-view.test.ts, output_digest: "sha256:e63fa2c4f36979f388d11ee182989a835cc3e877700ed80366ccb4cf3e081a47", result: "47/47 pass" }
      - { kind: typecheck, command: "npx --no-install tsc --noEmit", runner: node, scope: full, exit_code: 0, completed_at: "2026-07-30T21:50:07Z", evidence_path: src/requirements/requirement-generated-view.ts, output_digest: "sha256:44220009afe0690be55eb18f2b4b35dee3d3bb863b32a1b2318af0386a4f54fe", result: "exit 0" }
---

# PLAN-L7-489: 要求・要件生成ビュー／DB shadow投影

1. Red: path escape、marker欠落、owner/oracle orphanを反例化する。
2. Green: loader、human view、semantic parser、schema v40 shadow projectionを最小実装する。
3. Refactor: digest/root calculationをPR3 ownerへ集約し、raw payloadと別DBを追加しない。

PLAN-L6-90 pair freeze、U-RGV-001..007、typecheck、full CI、DB convergenceの成立と、
authoring runtimeと異なるAI-B reviewを同一HEADへ束縛した場合だけconfirmedへ遷移する。
