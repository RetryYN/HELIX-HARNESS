---
plan_id: PLAN-L7-653-distribution-lite-dependency-closure
title: "PLAN-L7-653 (impl): Lite consumer entrypointをdependency-closed exact setへ分離する"
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
  target_id: ADD_FEATURE
entry_signals:
  - "po_directive:Lite tarballをclean consumerで実利用可能にする"
created: 2026-08-22
updated: 2026-08-23
owner: Codex / TL
github_issue_id: 941
behavior_contract_id: DISTRIBUTION-LITE-DEPENDENCY-CLOSURE-001
responsibility_owner: distribution-lite-dependency-closure
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "DIST-LITE-R-02/R-04、consumer_core_v1 profile、capability artifact projectionが存在する"
contract_postconditions: "consumer entrypointからのstatic/dynamic dependencyとowned asset exact setがmissing 0になる"
contract_invariants: "Full HELIX唯一正本、Lite fork 0、全src fallback 0、excluded capability到達0"
contract_failures: "entrypoint欠落、relative import ownership欠落、dynamic asset未登録、excluded capability到達をtyped redにする"
tdd_red_required: true
red_test: "U-DISTCLOSE-004でcurrent src/cli.tsから267 missingを実測"
red_at: 2026-08-22T23:49:00+09:00
green_at: 2026-08-23T10:24:17+09:00
mutation_oracle_evidence: "resolvePhysicalSourceからsymlink拒否を一時除去するとU-DISTCLOSE-014bがok=trueでred（1 failed / 6 passed）。task-file ancestorのsymlink拒否を除去するとU-DISTCLOSE-013bがread成功でred（1 failed / 2 passed）。Luna reviewで空entrypoint、Windows absolute、logical traversal、duplicate optionの反例を実測し、U-DISTCLOSE-000／006b／014cとtask-file negative inputを追加して27/27 greenへ復元した"
complexity_effect: justified_positive
complexity_justification: "monolithic Full CLIをarchiveへ混入させずconsumer-safe compositionを再利用可能な境界へ分離する"
removal_trigger: "Full／consumer command registryが単一generated capability graphへ統合された時"
agent_slots:
  - { role: se, slot_label: "SE — consumer command registry／doctor composition" }
  - { role: qa, slot_label: "QA — import closure／excluded reachability mutation" }
parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-dependency-closure-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-000, test_path: tests/distribution-dependency-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-001, test_path: tests/distribution-dependency-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-002, test_path: tests/distribution-dependency-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-003, test_path: tests/distribution-dependency-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-005, test_path: tests/distribution-dependency-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-006, test_path: tests/distribution-consumer-command-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-006b, test_path: tests/distribution-consumer-command-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-007, test_path: tests/distribution-consumer-command-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-008, test_path: tests/distribution-consumer-command-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-009, test_path: tests/distribution-consumer-command-composition.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-010, test_path: tests/distribution-consumer-command-composition.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-011, test_path: tests/distribution-consumer-command-composition.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-012, test_path: tests/distribution-consumer-node-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-013, test_path: tests/distribution-consumer-node-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-013b, test_path: tests/distribution-consumer-node-adapter.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-014, test_path: tests/distribution-dependency-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-014b, test_path: tests/distribution-dependency-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-014c, test_path: tests/distribution-dependency-closure.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, oracle_id: U-DISTCLOSE-015, test_path: tests/distribution-dependency-closure.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-653-distribution-lite-dependency-closure.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/distribution-lite-dependency-closure.md, artifact_type: design_doc }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-dependency-closure-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/distribution-capability-artifact-catalog.json, artifact_type: config }
  - { artifact_path: src/setup/distribution-dependency-closure.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-consumer-command-registry.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-consumer-command-composition.ts, artifact_type: source_module }
  - { artifact_path: src/setup/distribution-consumer-node-adapter.ts, artifact_type: source_module }
  - { artifact_path: tests/distribution-dependency-closure.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-consumer-command-registry.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-consumer-command-composition.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-consumer-node-adapter.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-54-distribution-package-release.md
  requires:
    - docs/plans/PLAN-L7-652-distribution-lite-artifact-projection.md
    - docs/design/helix/L3-requirements/distribution-package-release-requirements.md
  references:
    - issue:937
    - issue:938
  blocks:
    - issue:856-profile-bound-builder
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewer_session_id: "792345fd-722c-4696-85eb-02494ab28d30"
    reviewed_at: "2026-08-23T07:17:56Z"
    tests_green_at: "2026-08-23T07:12:47Z"
    verdict: approve
    worker_model: codex:gpt-5.6-sol
    reviewer_model: claude:claude-opus-5
    reviewed_head_sha: bcb72746329647530b1b04761360d7dc930c1444
    scope: "PR #954 exact HEAD bcb72746329647530b1b04761360d7dc930c1444をClaude Opusが独立レビューした。path traversal／symlink／excluded reachability／dynamic ownership／task-file identityの8 guardをmutationで測定し、6件killed、realpath containment 1件は等価変異、read前size check 1件は非blockerとしてIssue #955へ分離した。CI run 32623930404、DB projection／replay、checkpoint／replayの一致をreceipt v4でsealし、blocker 0、verdict approve。receipt=https://github.com/RetryYN/HELIX-HARNESS/pull/954#issuecomment-5384804694"
    green_commands:
      - kind: unit_test
        command: "PATH=/home/tenni/.local/node24/node-v24.15.0-linux-x64/bin:$PATH npx --no-install vitest run --project fast tests/distribution-dependency-closure.test.ts tests/distribution-consumer-node-adapter.test.ts tests/distribution-consumer-command-registry.test.ts tests/distribution-consumer-command-composition.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-23T07:24:14Z"
        evidence_path: tests/distribution-dependency-closure.test.ts
        output_digest: "sha256:9493dbce453c43ece6df2703edd4d5100d46d7a0c965fbf8867abefe0cd0613b"
        result: "post-main read-afterで4 files／20 tests green"
      - kind: typecheck
        command: "PATH=/home/tenni/.local/node24/node-v24.15.0-linux-x64/bin:$PATH npx --no-install tsc --noEmit"
        runner: node
        scope: full
        exit_code: 0
        completed_at: "2026-08-23T07:24:14Z"
        evidence_path: src/setup/distribution-dependency-closure.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        result: "post-main read-afterでtsc --noEmit exit 0"
      - kind: lint
        command: "npx --no-install biome check src/setup/distribution-dependency-closure.ts src/setup/distribution-consumer-node-adapter.ts src/setup/distribution-consumer-command-registry.ts src/setup/distribution-consumer-command-composition.ts tests/distribution-dependency-closure.test.ts tests/distribution-consumer-node-adapter.test.ts tests/distribution-consumer-command-registry.test.ts tests/distribution-consumer-command-composition.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-23T07:24:14Z"
        evidence_path: src/setup/distribution-consumer-node-adapter.ts
        output_digest: "sha256:89869dfd74a9d3ae3c250eac5578798f517e0215d956e6fead1b83a349580549"
        result: "post-main read-afterでBiome 8 files checked、error 0"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-23T07:17:56Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-23T07:17:56Z"
    evidence_digest: "sha256:afb0760f1f0e8bcbf3d47bbb0f4f540e87465e5bb646d79da89ab2a6d096b771"
  entries: []
---

# PLAN-L7-653: Lite consumer依存閉包

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | AST dependency closureをRed→Green | fixtureでstatic／dynamic exact ownershipを反証可能にする |
| 2 | consumer-safe entrypoint／doctor compositionを分離 | Full monolithをLite artifactから除外する |
| 3 | current profileへ接続 | missing 0、excluded reachability 0 |
| 4 | clean staged build smoke | help／setup／status／consumer doctorが起動する |
| 5 | Claudeによるexact-HEADレビュー | blocker 0 |

## 実装・検収evidence

consumer command registry／composition／Node adapterをservice portへ分離し、Full機能集約の直接importを
adapterから除去した。current profileのdependency closureはmissing 0、excluded reachability 0、unsafe source 0で
greenとなり、PR #954 exact-HEAD reviewとCI／DB convergenceを完了した。archive生成とclean staged consumer E2Eは
後続Issue #947／#948が所有するため、本PLANの`completion_claim_allowed`はfalseを維持する。

## 非対象

archive生成、publish、tag、promotion、DevOS cutoverは実行しない。
