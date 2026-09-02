---
plan_id: PLAN-RECOVERY-89-review-evidence-supersession-structure
title: "PLAN-RECOVERY-89: review evidenceとsupersessionをfrontmatter構造へ束縛する"
kind: recovery
layer: cross
drive: agent
status: confirmed
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-02
updated: 2026-09-02
owner: Codex / TL
github_issue_id: 1446
behavior_contract_id: REVIEW-EVIDENCE-SUPERSESSION-STRUCTURE-001
responsibility_owner: evidence-structure-lint
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "PLAN evidenceとerrata edgeはleading frontmatter YAMLに構造化される"
contract_postconditions: "本文文字列はevidence／逆edgeにならず、block／flow styleのtyped fieldだけをexact照合する"
contract_invariants: "review evidenceのshape検証、supersede先実在、双方向exact plan_id、parse failureのfail-closeを維持する"
contract_failures: "本文によるpresence偽装、flow-style配列のsilent skip、無関係なPLAN言及による逆edge偽装を拒否する"
tdd_red_required: true
red_test: "本文だけにreview_evidenceを含むfixtureがtrueとなり、flow-style supersedesが空配列へ落ちることを再現した"
red_at: "2026-09-02T19:00:00+09:00"
green_at: "2026-09-02T19:20:00+09:00"
mutation_oracle_required: true
mutation_oracle_evidence: "tests/review-evidence.test.tsとtests/plan-supersession.test.tsがfrontmatter抽出を本文検索へ戻すmutationおよびYAML構造解析を旧line parserへ戻すmutationをredとしてkillし、62 tests greenへ復帰した。"
complexity_effect: net_negative
complexity_justification: "review evidence既存YAML extractorをpresence判定へ再利用し、supersessionの独自line/prose parserをyaml parserへ統合する"
removal_trigger: "なし。evidenceとauthority edgeの恒久的な構造境界"
backprop_decision: not_required
backprop_decision_reason: "Issue #1446で既存requirementsのevidence truthfulnessをRecoveryし、新しい要求意味は追加しない"
parent_design: docs/design/harness/L6-function-design/review-evidence.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
dependencies:
  parent: null
  requires: []
  references:
    - "issue:883"
    - "issue:1379"
    - "issue:1425"
    - "issue:1446"
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-89-review-evidence-supersession-structure.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: config }
  - { artifact_path: config/universal-improvement-source-registry.v1.json, artifact_type: config }
  - { artifact_path: config/universal-improvement-source-registry.v1.integrity.json, artifact_type: config }
  - { artifact_path: docs/design/harness/L6-function-design/review-evidence.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L7-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/review-evidence.ts, artifact_type: source_module }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: src/lint/branch-kind.ts, artifact_type: source_module }
  - { artifact_path: src/lint/plan-supersession.ts, artifact_type: source_module }
  - { artifact_path: src/lint/plan-specific-vpair-binding.ts, artifact_type: source_module }
  - { artifact_path: src/schema/frontmatter.ts, artifact_type: source_module }
  - { artifact_path: tests/review-evidence.test.ts, artifact_type: test_code }
  - { artifact_path: tests/branch-kind.test.ts, artifact_type: test_code }
  - { artifact_path: tests/plan-supersession.test.ts, artifact_type: test_code }
  - { artifact_path: tests/plan-descent-specific-parent-binding.test.ts, artifact_type: test_code }
  - { artifact_path: docs/plans/PLAN-L3-14-vmodel-canonical-authority-cutover.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L4-50-orchestration-memory-hybrid.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-102-web-dashboard-phase-b.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-143-harness-db-warn-remediation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-86-merged-plan-status-deliverable-scope.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-RECOVERY-11-impact-ci-stateful-deadline.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-RECOVERY-14-impact-ci-cancel-propagation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-RECOVERY-18-lane-inventory-partial-logs.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-RECOVERY-42-author-runtime-attestation.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-RECOVERY-43-attestation-merge-parent-detection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-RECOVERY-51-external-author-attestation.md, artifact_type: markdown_doc }
agent_slots:
  - { role: aim, slot_label: "AIM — evidence文字列と構造authorityの境界監査" }
  - { role: se, slot_label: "SE — YAML構造解析とexact edge実装" }
  - { role: qa, slot_label: "QA — 本文偽装／flow-style／片方向edge反例" }
  - { role: tl, slot_label: "TL — #1446 Recovery収束" }
review_evidence: []
---

# Evidence／supersession構造境界 Recovery

PLAN本文の例や無関係な参照を機械証拠として数えず、leading frontmatterのtyped fieldだけを
review evidenceおよび訂正edgeの正本として扱う。
