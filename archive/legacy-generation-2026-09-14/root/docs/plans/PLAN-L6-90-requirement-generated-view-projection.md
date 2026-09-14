---
plan_id: PLAN-L6-90-requirement-generated-view-projection
title: "PLAN-L6-90 (add-design): Requirement generated view／DB shadow projection"
kind: add-design
layer: L6
drive: agent
status: confirmed
route_mode: add-feature
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
contract_preconditions: "PLAN-L6-89の153/24/72/24 stable-ID shadow shardとroot manifestがpair freeze済みである"
contract_postconditions: "generated Markdown round-trip、manifest存在時の既存harness.db shadow rebuild x2、manifest不在consumerの0 row互換が実装可能な粒度で確定する"
contract_invariants: "PR5までlegacy Markdown authorityを維持し、別DB／別engine／canonical writer／Design Template JSONを追加しない"
contract_failures: "manifest存在後のpath、kind、count、stable ID、shard/root digest、round-trip、DB denominator、owner/oracle不一致を拒否し、manifest不在だけは非導入として許容する"
tdd_red_required: false
complexity_effect: justified_positive
complexity_justification: "generator/parserと既存DBの1 tableを追加するが、raw requirement本文をDBへ複製せず別service／dependencyを作らない"
removal_trigger: "PR5 cutoverでshadow authorityがcanonical readerへ吸収され、shadow projection consumerが0になった時点"
parent_design: docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md
pair_artifact: docs/test-design/helix/L8-requirement-generated-view-projection-unit-test-design.md
agent_slots:
  - role: se
    slot_label: "SE — stable-ID shard loader、generated view、DB projection"
  - role: qa
    slot_label: "QA — round-trip、digest drift、rebuild x2、orphan反例"
  - role: tl
    slot_label: "TL — authority境界とschema revision review"
generates:
  - { artifact_path: docs/plans/PLAN-L6-90-requirement-generated-view-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-requirement-generated-view-projection-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L6-89-requirement-ir-shadow-migration.md
  requires:
    - docs/plans/PLAN-L6-89-requirement-ir-shadow-migration.md
  references:
    - generated/requirements-ir/manifest.json
    - docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md
  blocks:
    - docs/plans/PLAN-L7-489-requirement-generated-view-projection.md
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

# PLAN-L6-90: 要求・要件生成ビュー／DB shadow投影

PR3 shadow JSONからgenerated Markdownと既存harness.db shadow read modelを再構築する。
本PLANのconfirmはL6設計とL8 test-designのpair freezeだけを意味し、PR5 canonical cutover、
G1/G3 freeze、Design Template JSON完了を意味しない。
