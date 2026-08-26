---
plan_id: PLAN-L7-682-lite-canary-ci-parallelization
title: "PLAN-L7-682 (impl): Lite canary CIをprofile closure条件で並列化する"
kind: impl
layer: L7
drive: agent
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: PERFORMANCE_REFACTOR
entry_signals:
  - "po_directive:Issue #1002 Lite consumer canary CI parallelization"
created: 2026-08-26
updated: 2026-08-27
owner: Codex / TL
github_issue_id: 1002
behavior_contract_id: LITE-CANARY-CI-PARALLEL-001
responsibility_owner: lite-canary-ci-orchestration
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "既存のconsumer_core_v1 profile、artifact builder、Linux／Windows canary、Full harness gateが利用できる"
contract_postconditions: "fast closure selectorとtyped lane aggregateを追加し、Lite heavy laneを安全にFull laneと並列起動できる"
contract_invariants: "harness-check 1本、Full回帰、source／profile／artifact／digest binding、Linux artifact authority、Windows same-artifactを弱めない"
contract_failures: "closure contact、配布文書／Windows durability coverage contact、削除／rename、generated dependency（Lite artifact build入口src/cli.tsを含む）、manifest、uncertainty（PR base／head／ref欠落またはGit branch ref形式違反を含む）、path read failure、stale digest、fast check failureはrequiredまたはaggregate failureへ倒す"
tdd_red_required: true
red_test: "U-LITECI-001..007、U-DISTCLOSE-016..018、U-LITECI-WF-001..004でskip境界、PR context、build entrypoint coverage、fast check、relation graph、DAG、typed aggregateを先に固定する"
red_at: "2026-08-26T14:22:34Z"
green_at: "2026-08-26T14:22:44Z"
mutation_oracle_evidence: "2026-08-26T14:22:34Zにsrc/runtime/impact-ci.tsのselectLiteCanaryLaneのfail-close分岐を一時的にif (true)へ変異し、tests/impact-ci.test.tsが5 failed / 18 passed (exit 1)となることを実測した。U-LITECI-002..005とrepository selector CLIのrequired判定がauthorized_skipへ退行したため変異をkillした。実装を復元し、2026-08-26T14:22:44Zに同テストを23 passed (exit 0)で再確認した。"
complexity_effect: justified_positive
complexity_justification: "既存artifact builderとFull laneを再利用し、selectorと最終typed aggregateだけを追加するため、並列実行境界の明示分だけを増やす"
removal_trigger: "Lite canaryのprofile closure判定と全OS artifact admissionが単一の既存 gateへ統合され、独立job境界が不要になった時"
parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md
pair_artifact: docs/test-design/helix/L8-lite-canary-ci-parallelization-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, oracle_id: U-LITECI-001, test_path: tests/impact-ci.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, oracle_id: U-LITECI-002, test_path: tests/impact-ci.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, oracle_id: U-LITECI-003, test_path: tests/impact-ci.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, oracle_id: U-LITECI-004, test_path: tests/impact-ci.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, oracle_id: U-DISTCLOSE-016, test_path: tests/distribution-dependency-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, oracle_id: U-LITECI-WF-001, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, oracle_id: U-LITECI-WF-002, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, oracle_id: U-LITECI-WF-003, test_path: tests/harness-check-workflow.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, oracle_id: U-LITECI-005, test_path: tests/impact-ci.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, oracle_id: U-LITECI-006, test_path: tests/impact-ci.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, oracle_id: U-LITECI-007, test_path: tests/impact-ci.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, oracle_id: U-DISTCLOSE-017, test_path: tests/distribution-dependency-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, oracle_id: U-DISTCLOSE-018, test_path: tests/distribution-dependency-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, oracle_id: U-LITECI-WF-004, test_path: tests/relation-graph-loader.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-682-lite-canary-ci-parallelization.md, artifact_type: markdown_doc }
  - { artifact_path: src/cli/lite-canary-selector.ts, artifact_type: source_module }
  - { artifact_path: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-lite-canary-ci-parallelization-unit-test-design.md, artifact_type: test_design }
modifies:
  - { artifact_path: .github/workflows/harness-check.yml, artifact_type: workflow_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: src/runtime/impact-ci.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-dependency-closure.ts, artifact_type: source_module }
  - { artifact_path: src/graph/loader.ts, artifact_type: source_module }
  - { artifact_path: src/lint/relation-graph.ts, artifact_type: source_module }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-lite-consumer-canary.test.ts, artifact_type: test_code }
  - { artifact_path: tests/impact-ci.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-dependency-closure.test.ts, artifact_type: test_code }
  - { artifact_path: tests/harness-check-workflow.test.ts, artifact_type: test_code }
  - { artifact_path: tests/relation-graph-loader.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-657-distribution-lite-consumer-canary.md
  requires:
    - docs/plans/PLAN-L7-653-distribution-lite-dependency-closure.md
    - docs/design/helix/L3-requirements/distribution-package-release-requirements.md
  references:
    - issue:1002
  blocks: []
agent_slots:
  - { role: se, slot_label: "SE — profile closure selector／workflow DAG" }
  - { role: qa, slot_label: "QA — fail-close mutation／typed aggregate" }
---

# PLAN-L7-682: Lite canary CIをprofile closure条件で並列化する

## §1 対象と責務

本PLANはIssue #1002のCI orchestrationだけを扱う。既存のLite artifact builder、Linux canary、
Windows same-artifact smoke、Full harness regressionを所有元として再利用し、profile／manifest／
dependency closureから安全に判定できる pull request だけ重いLite laneを省略する。Full laneの
coverageとbranch protectionの意味は変更しない。

## §2 実装順

1. fast checkとselectorのRed oracleを追加し、非接触skipと全fail-close条件を固定する。
2. Lite jobをselector／typed status付きにし、Linux検証済みartifactだけをWindowsへ渡す。
3. Full jobをLiteから独立させ、Lite、Windows、Fullを単一のtyped aggregateへ接続する。
4. L6/L8 pair、verification binding、targeted test、typecheck、Biome、PLAN lintで検証する。

## §3 受入条件

- `tests/impact-ci.test.ts` と `tests/distribution-dependency-closure.test.ts` が fast check、digest、
  deletion／rename／manifest／generated dependency／uncertainty／path failureとcoverage pathの
  推移import依存を実際に検査する。
- `tests/harness-check-workflow.test.ts` が独立job DAG、同一artifact搬送、typed output、aggregate
  exact acceptanceを検査する。
- workflowに第二のbuilder、boolean skip、`continue-on-error`、required checkの追加がない。
- 実測したgreen commandと失敗した環境依存commandを分離して記録し、review receiptは人間／別runtimeの
  実測なしに追加しない。

## §4 非対象と後続

publish、tag、release candidate promotion、branch protection設定変更、shared DB／runtime state、
旧artifact authorityのcutoverは対象外であり、別のapproval-bound PLANに残す。
