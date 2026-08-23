---
plan_id: PLAN-L7-660-lite-document-rule-oracles
title: "PLAN-L7-660 (impl): Lite配布文書guardを規則単位oracleへ固定する"
kind: impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-08-24
updated: 2026-08-24
owner: Codex / TL
github_issue_id: 970
behavior_contract_id: DISTRIBUTION-LITE-DOCUMENT-RULE-ORACLES-001
responsibility_owner: distribution-lite-consumer-documents
engineering_discipline_required: true
change_slice: atomic
refactor_step: characterize
legacy_retirement_state: not_applicable
no_code_decision: no_change
ddd_modeling_decision: none
contract_preconditions: "Lite配布文書guardとbuilder拒否境界がproduction実装済みである"
contract_postconditions: "空文書、配布先identity欠落、development guidance、builder接合、runtime third-party inputの各規則が独立反例でredになる"
contract_invariants: "配布文書bytes、document manifest schema、production failure codeを変更しない"
contract_failures: "各guardまたはbuilder拒否を除去したmutationを対応するU-DISTDOC oracleが検出する"
tdd_red_required: false
tdd_red_waiver_reason: "Issue #970に9 seeded defects中5件SURVIVEDの実測とbuilder誤admit反例が記録済みであり、未記録timestampを捏造しない"
complexity_effect: net_increase
complexity_justification: "production分岐を増やさず、規則単位fixtureとesbuild境界mockだけを追加する"
removal_trigger: "各規則が別のgenerated contract verifierへ置換され同等mutation evidenceが固定された時"
mutation_oracle_evidence: "Claude独立レビューでN2/N3/N4/N6/N7 SURVIVEDを実測。各規則を独立fixtureへ分解して削除mutationをred化する"
parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md
pair_artifact: docs/test-design/helix/L8-distribution-lite-consumer-documents-unit-test-design.md
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:PR #963のClaude独立レビュー由来Issue #970を原子的に回収する"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, oracle_id: U-DISTDOC-007, test_path: tests/distribution-lite-documents.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, oracle_id: U-DISTDOC-008, test_path: tests/distribution-lite-documents.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, oracle_id: U-DISTDOC-009, test_path: tests/distribution-lite-documents.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/distribution-lite-consumer-documents.md, oracle_id: U-DISTDOC-010, test_path: tests/distribution-lite-runtime-third-party.test.ts }
agent_slots:
  - { role: qa, slot_label: "QA — 規則単位mutation oracle" }
  - { role: tl, slot_label: "TL — production source不変とbuilder接合確認" }
review_evidence: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-660-lite-document-rule-oracles.md, artifact_type: markdown_doc }
  - { artifact_path: docs/test-design/helix/L8-distribution-lite-consumer-documents-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/distribution-lite-documents.test.ts, artifact_type: test_code }
  - { artifact_path: tests/distribution-lite-runtime-third-party.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-658-lite-consumer-distribution-docs.md
  requires:
    - docs/plans/PLAN-L7-658-lite-consumer-distribution-docs.md
  references:
    - issue:970
  blocks:
    - issue:970
---

# Lite配布文書guardの規則単位検証

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | README反例の分離 | 正規READMEへ禁止句を挿入し、別規則による代替redを排除 |
| 2 | 文書別empty oracle | 5文書を個別に空白化して`document_empty`を確認 |
| 3 | identity／builder接合 | 配布先token欠落とclean commit上の文書redをexact failureで拒否 |
| 4 | runtime input境界 | esbuild metafileのthird-party inputをartifact生成前に拒否 |
| 5 | 回帰確認 | targeted、typecheck、Biome、PLAN lintがgreen |

## 境界

配布文面、manifest schema、production guard、publish経路は変更しない。
