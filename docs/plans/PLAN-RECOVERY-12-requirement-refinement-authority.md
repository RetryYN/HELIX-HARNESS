---
plan_id: PLAN-RECOVERY-12-requirement-refinement-authority
title: "PLAN-RECOVERY-12: Requirement refinement JSON authority"
kind: recovery
layer: cross
drive: agent
status: draft
route_mode: recovery
entry_signals:
  - "po_directive:2026-08-05 Issue #396のMIC JSON authority欠落をRecoveryでfail-closeする"
created: 2026-08-05
updated: 2026-08-05
owner: Codex / TL
github_issue_id: 396
parent_design: docs/design/helix/L5-detail/requirement-refinement-authority.md
pair_artifact: docs/test-design/helix/L8-requirement-refinement-authority-unit-test-design.md
engineering_discipline_required: true
behavior_contract_id: REQUIREMENT-JSON-DELTA-ADMISSION-001
responsibility_owner: requirement-json-delta-admission
change_slice: atomic
refactor_step: consolidate_authority
legacy_retirement_state: not_applicable
no_code_decision: modify
ddd_modeling_decision: aggregate
contract_preconditions: "153/24/72/24 frozen baselineとJSON-only consumer policyがcurrentで、L3 refinementのMarkdown-only gapが再現する"
contract_postconditions: "baselineを改変せず、approved refinement bundleを同じRequirement JSON root、generated view、requirement_ir projectionへ原子的に接続する"
contract_invariants: "baseline digest不変、dual authority 0、別ledger／別DB table 0、owner／AC／oracle欠落重複0、PO approvalなしのfreeze 0"
contract_failures: "Markdown-only、owner不在、partial update、stale source／approval、compatibility誤昇格、baseline silent rewriteをfail-closeする"
tdd_red_required: true
complexity_effect: net_neutral
complexity_justification: "既存manifest、generated view、requirement_ir projectionへrefinement partitionを加え、別engine・別DB・別workflowを作らない"
removal_trigger: "refinementがbaseline record revisionへ正規統合され、consumer 0とmigration receiptが成立した時点"
irreversible_impact: none
agent_slots:
  - { role: aim, slot_label: "AIM — refinement authorityとFeature再入場境界" }
  - { role: se, slot_label: "SE — JSON root／typed refinement admission" }
  - { role: qa, slot_label: "QA — baseline保全／partial update／mutation oracle" }
  - { role: tl, slot_label: "TL — L3 trace／PO approval／Feature #92 unblock判断" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-12-requirement-refinement-authority.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/requirement-refinement-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/requirement-refinement-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-requirement-refinement-authority-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L9-requirement-refinement-authority-system-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: config/requirement-ir-schema.json, artifact_type: json_config }
  - { artifact_path: config/requirement-ir-authority.json, artifact_type: json_config }
  - { artifact_path: config/digest-canonicalization-inventory.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/manifest.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/refinement_contracts.json, artifact_type: json_config }
  - { artifact_path: docs/generated/requirements/requirement-definition.generated.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/management-integration-cell-requirements.md, artifact_type: design_doc }
  - { artifact_path: src/requirements/requirement-authority.ts, artifact_type: source_module }
  - { artifact_path: src/requirements/requirement-refinement-authority.ts, artifact_type: source_module }
  - { artifact_path: src/requirements/requirement-generated-view.ts, artifact_type: source_module }
  - { artifact_path: src/requirements/requirement-generated-view-generator.ts, artifact_type: source_module }
  - { artifact_path: src/requirements/requirement-authority-gate.ts, artifact_type: source_module }
  - { artifact_path: src/requirements/requirement-ir-authority-cutover.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-refinement-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/digest.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-authority.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view-db.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-ir-shadow.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-management-integration-cell.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-490-requirement-json-authority-cutover.md
  requires:
    - docs/design/helix/L3-requirements/management-integration-cell-requirements.md
    - docs/test-design/helix/management-integration-cell-acceptance.md
    - docs/plans/PLAN-L3-43-management-integration-cell-model.md
  blocks:
    - issue:213
    - issue:397
---

# PLAN-RECOVERY-12: 要件refinement JSON正本

## 工程表

1. Red: MICがMarkdownだけに存在しても現gateがgreenになる反例、owner欠落、partial shard、baseline改変を固定する。
2. L4/L9: baselineとrefinementを同じauthority rootの別partitionとして構成し、全体の合否境界を閉じる。
3. L5/L8: bundle schema、revision、approval、digest、R→AC、source、downstreamのexact contractを閉じる。
4. Green: 既存loader／generated view／DB projection／doctorへ最小統合し、別ledgerと別tableを作らない。
5. Refactor: 固定分母`153/24/72/24`をbaseline分母として残し、current totalと混同する表示だけを除去する。
6. Closure: targeted、typecheck、Biome、PLAN governance、doctor、full CI、DB x2、独立AI-Bを同一HEADで閉じる。

## 受入条件

- 153/24/72/24 baseline recordとbaseline digestをbyte-for-byte維持する。
- MICのL3 traceにprimary ownerとrelated ownerのexact setがあり、JSON bundleと一致する。
- MIC-FR-001、MIC-R-01..07、MIC-AC-001..012をJSON rootから逆引きできる。
- L3 sourceとL10 oracleのdigest、PLAN、downstream Issue、PO delta receiptがcurrentでなければadmitしない。
- partial shard、unknown field、ID重複、R→AC未被覆、compatibility source、stale approvalをRedにする。
- `requirement_ir`同一tableへ投影し、別Requirement Engine、別ledger、別DB table、別workflowを追加しない。

## 非対象

- #213〜#215のruntime実装。
- MIC以外の全refinement family収載（#397）。
- 153 baseline requirementの意味変更。
- Design Template JSON #290。
