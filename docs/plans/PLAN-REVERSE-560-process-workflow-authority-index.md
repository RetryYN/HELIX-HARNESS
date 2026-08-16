---
plan_id: PLAN-REVERSE-560-process-workflow-authority-index
title: "PLAN-REVERSE-560: process workflow索引をtyped axis authorityへ再接着する"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: normalization
forward_routing: L3
promotion_strategy: reuse-with-hardening
drive: agent
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.4
  registry_source_digest: sha256:0ff1f90cd2e329b52f784ada54c18d06a79253488664290290327b81bef17f47
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals:
  - "po_directive:Issue #206 process索引が旧15-route catalogを意味正本として異軸分類を再統合している"
created: 2026-08-16
updated: 2026-08-16
owner: Codex / TL
github_issue_id: 206
behavior_contract_id: PROCESS-WORKFLOW-AUTHORITY-001
responsibility_owner: process-workflow-authority-index
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "docs/process/modes/README.mdが旧15-route catalogを機械経路正本とし、development style、case-driven model、workflow model、subrouteを共通route一覧へ畳み込む"
contract_postconditions: "process索引がrequirements registryを唯一の意味authorityとしてversioned typed tupleと独立axisを案内し、旧catalogをcompatibility inventoryへ限定する"
contract_invariants: "current identityはregistry version／digest／axis／IDのtupleであり、PLAN kind、drive、execution mode、specialist workflow／capabilityを代用しない"
contract_failures: "旧catalog共同正本、15-route exact set、ScrumとDiscoveryのstate machine混同、legacy current再出力、曖昧入力推測を拒否する"
tdd_red_required: false
tdd_red_waiver_reason: "current-main process索引の旧authority記述が既存Redであり、U-PWFA-001〜004を同一sliceで追加して再導入をfail-closeする"
mutation_oracle_evidence: "U-PWFA-001〜004がauthority pointer、typed tuple、axis行、state-machine親、input-only境界を独立assertし、旧15-route headingまたは旧catalog正本文の再導入をkillする"
complexity_effect: net_negative
complexity_justification: "共同正本と共通route enum説明を除去し、requirements registryからの一方向projectionへ単純化する"
removal_trigger: "process索引がversioned registryから完全生成され、手書きprojection consumerが0になった時点"
pair_artifact: docs/test-design/helix/github-autonomous-operations-acceptance.md
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/governance/helix-harness-requirements_v1.3.md
    reason: "§4.2.1の独立axis、generated catalog、legacy compatibility inventory境界を変更せずprocessへ投影する。"
  - layer: L10-system-test
    decision: preserve
    evidence_path: docs/test-design/helix/github-autonomous-operations-acceptance.md
    reason: "GH-T-001のlegacy current再出力拒否をprocess索引の実行可能oracleへ具体化する。"
agent_slots:
  - { role: se, slot_label: "SE — process索引のtyped axis再投影" }
  - { role: qa, slot_label: "QA — 旧catalog共同正本／axis混同mutation" }
  - { role: tl, slot_label: "TL — requirements registryとの意味一致" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-560-process-workflow-authority-index.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/README.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: tests/process-workflow-authority.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L3-61-github-workflow-guidance-authority.md
  requires:
    - docs/plans/PLAN-L3-55-workflow-classification-registry.md
    - docs/plans/PLAN-L3-60-workflow-catalog-projection-authority.md
    - docs/plans/PLAN-L3-61-github-workflow-guidance-authority.md
  references:
    - config/workflow-classification-catalog.v1.json
    - config/drive-route-catalog.json
---

# process workflow索引のtyped authority再接着

## R0 現状採取

current-mainの`docs/process/modes/README.md`は`config/drive-route-catalog.json`を機械経路正本とし、
「15 route exact set」をcurrent一覧として提示していた。そのためrequirements v1.3.11で分離済みの
development style、case-driven model、workflow model、subrouteが人間向けsurfaceで再び共通routeへ畳まれていた。

## R1 skip判定

normalizationは既知のauthority driftを正規化するためR1をskipする。未知分類や曖昧入力は推測せず、
requirements registryのunsupported／ambiguous dispositionへ委ねる。

## R2 As-Is照合

意味authorityはrequirements、machine-readable mirrorはworkflow classification registry、
current catalogはgenerated projection、旧15-route catalogはcompatibility inventoryである。
current identityはregistry version、source digest、target axis、target IDのexact tupleである。

## R3 意図照合

Issue #206とPO指示は旧語の名称変更ではなく、新requirementsから旧定義を一新することを要求する。
索引を15-routeの改名表にせず、独立axis、state-machine親、input-only adapter、L1–L12再入を
requirementsの順序で案内する。

## R4 Forward再入

本sliceは索引だけを所有する。Scrum／Discovery本文、workflow model各文書、README、setup、
CLI／label／template、runtime／DB／doctor projectionはIssue #206の後続atomic sliceへ残す。
U-PWFA-001〜004と全authority gate、Claude exact-HEAD review、main read-afterがgreenになるまで
completion claimを許可しない。
