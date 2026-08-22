---
plan_id: PLAN-REVERSE-563-process-readme-typed-authority
title: "PLAN-REVERSE-563: process READMEをrequirements typed authorityへ再接着する"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: normalization
forward_routing: L3
promotion_strategy: reuse-with-hardening
drive: agent
status: confirmed
completion_claim_allowed: false
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-16T19:38:46Z"
    tests_green_at: "2026-08-16T19:38:46Z"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "Issue #206のprocess READMEをrequirements-owned typed axis、generated catalog、compatibility inventory境界へ照合した。旧駆動モデルの共通分類、L0-L14のcurrent判定、legacy identityの生成物再出力を除去し、L1-L12、独立axis、signal導出線、evidence境界をcurrent guidanceへ固定した。"
    green_commands:
      - kind: unit_test
        command: "npm exec --offline -- vitest run tests/process-readme-authority.test.ts tests/l12-hybrid-recognition.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tests/process-readme-authority.test.ts
        output_digest: "sha256:9b727b51d6d827bb203cb97b6e9133dd4b63de4c11fe444245823bb8155b93d3"
        result: "process README authority oracleとL12 recognition oracleの27 tests green"
      - kind: typecheck
        command: "npm exec --offline -- tsc --noEmit"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: tsconfig.json
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        result: "TypeScript typecheck green"
      - kind: lint
        command: "npm exec --offline -- tsx src/cli.ts plan lint docs/plans/PLAN-REVERSE-563-process-readme-typed-authority.md"
        runner: node
        scope: targeted
        exit_code: 0
        evidence_path: docs/plans/PLAN-REVERSE-563-process-readme-typed-authority.md
        output_digest: "sha256:c400235ede2fca001534df78a2e14d12d94f6ad6c6937b1ef8e92875e32ab590"
        result: "PLAN lint green"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #206 process READMEが旧axis、旧layer、旧入口分類をcurrent guidanceとして再出力している"
created: 2026-08-17
updated: 2026-08-17
owner: Codex / TL
github_issue_id: 206
behavior_contract_id: PROCESS-README-TYPED-AUTHORITY-001
responsibility_owner: process-readme-typed-authority
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "docs/process/README.mdがPLAN kind、layer、drive、入口workflowを共通分類として説明し、旧authorityの手順をcurrent入口へ案内している"
contract_postconditions: "process READMEがrequirementsを意味authority、registryをtyped mirror、catalogをgenerated projectionとして案内し、L1-L12、独立axis、signal導出線、evidence境界をcurrent guidanceにする"
contract_invariants: "development style、case-driven model、workflow model、subroute、specialist drive、PLAN kind、execution mode、specialist workflow、capabilityを別axisで保持する"
contract_failures: "旧入口分類のcurrent再出力、Production ScrumとDiscoveryの同一axis化、旧layerのcurrent判定利用、legacy identityの生成物再出力、L1-L12 evidenceなしの完了主張を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "current-main process READMEのauthority driftを同一sliceで是正し、U-PRTA-001〜006でtyped boundaryとlegacy隔離をfail-closeする"
mutation_oracle_evidence: "U-PRTA-001〜006がauthority pointer、axis分離、style/state境界、signal導出線、L1-L12 pair、compatibility boundaryを独立assertする"
complexity_effect: net_negative
complexity_justification: "四軸の共通enum説明と旧入口手順を除去し、requirementsからprocess surfaceへの一方向導出へ整理する"
removal_trigger: "process guidanceがversioned registryから完全生成され、手書きprojection consumerが0になった時点"
pair_artifact: docs/test-design/helix/github-autonomous-operations-acceptance.md
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/governance/helix-harness-requirements_v1.3.md
    reason: "§1、§2、§4、§4.1、§4.2のL1-L12、development style、case-driven model、subroute、evidence境界をprocess入口へ投影する。"
  - layer: L10-system-test
    decision: preserve
    evidence_path: docs/test-design/helix/github-autonomous-operations-acceptance.md
    reason: "typed identity、legacy current再出力拒否、route receipt、独立review、DB convergenceをprocess READMEのoracleへ具体化する。"
agent_slots:
  - { role: se, slot_label: "SE — process READMEのtyped authority再投影" }
  - { role: qa, slot_label: "QA — axis混同／legacy current再出力mutation" }
  - { role: tl, slot_label: "TL — requirements registryとの意味一致" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-563-process-readme-typed-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/README.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/process-readme-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-REVERSE-562-drive-route-system-typed-authority.md
  requires:
    - docs/plans/PLAN-REVERSE-560-process-workflow-authority-index.md
    - docs/plans/PLAN-REVERSE-561-scrum-discovery-typed-process.md
    - docs/plans/PLAN-REVERSE-562-drive-route-system-typed-authority.md
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/design/helix/L3-requirements/workflow-classification-registry.v1.json
    - config/workflow-classification-catalog.v1.json
    - config/drive-route-catalog.json

---

# process READMEのtyped authority再接着

## R0 現状採取

current-mainのprocess READMEは、PLAN分類のkind、layer、drive、workflow phaseと入口workflowを一つの
「駆動モデル」体系として案内し、旧layerのpathと旧要件参照をcurrent手順へ混在させていた。requirements
v1.3.11とregistry v1.1.4で分離済みのaxisが、人間向け入口だけ旧構造へ戻っていた。

## R1 skip判定

既知のauthority driftを正規化するReverse sliceなのでR1をskipする。新しいrouteや分類を推測せず、
requirements registryにない値はunsupportedまたはambiguousとして扱う。

## R2 As-Is照合

意味authorityはrequirements、typed mirrorはversioned registry、current catalogはgenerated projection、
旧catalogはcompatibility inventoryである。current identityはregistry version、source digest、target axis、
target IDのexact tupleであり、PLAN kind、specialist drive、execution modeの代用にはしない。

## R3 意図照合

Issue #206とPO指示は旧語の置換ではなく、新requirementsから旧定義を是正することである。本sliceは
process READMEにL1-L12のpair、development style、case-driven model、workflow model、subroute、signal導出線、
evidenceとcompatibility境界を投影し、Production ScrumとDiscoveryを同じ分類へ戻さない。

## R4 Forward再入

本sliceはprocess入口READMEとそのoracleだけを所有する。残る個別workflow文書、README、CLI、labels、templates、
runtime／DB／doctor consumerは#206の後続atomic sliceへ残す。U-PRTA-001〜006、全authority gate、Claude
exact-HEAD review、main read-afterがgreenになるまでcompletion claimを許可しない。
