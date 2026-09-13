---
plan_id: PLAN-RECOVERY-1768-canonical-terminal-claim
title: "PLAN-RECOVERY-1768: 旧終端claimのcurrent判定分離"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
owner: Codex / TL
created: 2026-09-13
updated: 2026-09-13
github_issue_id: 1768
behavior_contract_id: CANONICAL-LAYER-TERMINAL-CLAIM-001
responsibility_owner: project-current-location
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
contract_preconditions: "canonical layer authorityはL1-L12であり、旧layer体系はcompatibility projectionである"
contract_postconditions: "旧終端claimはtelemetryに残るがcurrent completionをblockせず、同一release／contract revision scopeを検証済みのtyped L12 findingだけがRecoveryを起動する"
contract_invariants: "open work、L12 coverage、設計driftの検出を弱めず、legacy successでcanonical failureを相殺しない"
contract_failures: "scopeなしglobal join、旧終端層のcurrent terminal昇格、typed L12矛盾のwarn化、観測削除を拒否する"
tdd_red_required: true
red_at: "2026-09-13T08:06:14Z"
green_at: null
mutation_oracle_required: true
mutation_oracle_evidence: "U-CURRENT-LOCATION-001a/001bがcompatibility warn削除、旧終端Recovery復帰、typed L12 error無視をそれぞれ拒否する"
complexity_effect: net_negative
complexity_justification: "旧層番号のglobal completion joinを除去し、管理relation由来のscoped finding一系統へ集約する"
removal_trigger: "旧終端層compatibility projectionと関連fieldのconsumer-zeroが成立した時"
entry_signals: [regression_dev]
parent_design: docs/design/helix/L6-function-design/visualization-view-model.md
pair_artifact: docs/test-design/helix/visualization-view-model.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/visualization-view-model.md, oracle_id: U-CURRENT-LOCATION-001a, test_path: tests/current-location.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/visualization-view-model.md, oracle_id: U-CURRENT-LOCATION-001b, test_path: tests/current-location.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/visualization-view-model.md, oracle_id: U-CLDB-005, test_path: tests/current-location-db-workflow-identity.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/visualization-view-model.md, oracle_id: U-CURRENT-LOCATION-001c, test_path: tests/slow/doctor.test.ts }
agent_slots:
  - { role: aim, slot_label: "AIM — current authorityと互換観測の分離監査" }
  - { role: tl, slot_label: "TL — canonical／compatibility判定境界" }
  - { role: qa, slot_label: "QA — false blockとfalse passの反例" }
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
dependencies:
  requires: []
  references: ["issue:1768", "issue:1737", "issue:1743"]
  blocks: ["issue:1743"]
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-1768-canonical-terminal-claim.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/current-location.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: src/schema/current-location-workflow-identity-resolver.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/visualization-read-model.ts, artifact_type: source_module }
  - { artifact_path: src/workflow/current-location-workflow-identity.ts, artifact_type: source_module }
  - { artifact_path: docs/design/helix/L6-function-design/visualization-view-model.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/operation-scope.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/visualization-view-model.md, artifact_type: test_design }
  - { artifact_path: tests/current-location.test.ts, artifact_type: test_code }
  - { artifact_path: tests/current-location-db-workflow-identity.test.ts, artifact_type: test_code }
  - { artifact_path: tests/cli-surface.test.ts, artifact_type: test_code }
  - { artifact_path: tests/db-projection-ingestion.test.ts, artifact_type: test_code }
  - { artifact_path: tests/slow/doctor.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
  - { artifact_path: config/objective-evidence-substance-binding.v1.json, artifact_type: json_config }
review_evidence: []
---

# 旧終端claimのcurrent判定分離

## 修復契約

旧終端層のterminal PLANとopen L7の併存は、移行状況を示すcompatibility telemetryとしてwarnで保持するが、
current completionの`contradicted`やRecovery起動根拠にはしない。current矛盾は、管理relationがreleaseと
contract revisionの同一scopeを検証して保存した`canonical_l12_terminal_with_open_work` findingだけから導出する。

## 非対象

- 旧終端層のhistorical artifact、既存telemetry fieldの削除
- release／contract revision scopeの推測
- open work、設計drift、coverage gapの検査緩和
- リリース公開、tag付与、配布、切替

## 残義務

`canonical_l12_terminal_with_open_work`のproduction producerは本sliceには存在せず、現時点の実DBでは
管理relation由来findingを生成できない。fixtureによるconsumer検証を実運用上の検出能力完成とは扱わない。
#1771の管理relation admissionを入口として、release／contract revision scopeをexact照合するproducer、
単一writer、再観測を後続sliceで実装し、実DBへの注入なしread-afterで検出を実証するまで未解消として追跡する。

## 完了条件

1. 旧終端層とopen L7だけのfixtureはtelemetryを保持したままcurrentをblockしない。
2. scoped canonical L12 findingはerrorとしてRecoveryへ伝播する。
3. mainの旧終端false blockが消え、full doctorと停止中PRのfinalizeがgreenになる。
4. targeted、full CI、独立exact-HEAD review、main read-afterを通す。
5. false block解消後の`Forward`は旧token再分類を行わず、typed Full V既定としてDBへ投影する。
