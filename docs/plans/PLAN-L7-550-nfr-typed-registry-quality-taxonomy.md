---
plan_id: PLAN-L7-550-nfr-typed-registry-quality-taxonomy
title: "PLAN-L7-550 (add-impl): NFR typed registry、migration admission、doctor gate"
kind: add-impl
layer: L7
drive: agent
status: draft
completion_claim_allowed: false
route_mode: add-feature
entry_signals: ["po_directive:Issue #219 の pure validator と doctor admission を実装する"]
created: 2026-08-12
updated: 2026-08-12
owner: Codex / TL
github_issue_id: 219
engineering_discipline_required: true
behavior_contract_id: NFR-TYPED-REGISTRY-001
responsibility_owner: nfr-registry
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L4-73／L5-99／L6-105 がdraftとして同一atomic sliceにあり、requirements v1.3 HR-NFR-REG-001..003と#220／#221境界へ束縛されている"
contract_postconditions: "typed registry config 3 entry、pure validator、stable-ID migration admission、doctor wiring、U-NFRREG-001..017、IT-NFRREG-001..002を実装し、unknown／partial／driftをfail-closeする"
contract_invariants: "registry moduleは評価・probe実行・履歴保存・DB更新・networkを行わない。source digestはrepo-relative real path内の実bytesだけへ束縛する。doctorはread-onlyである"
contract_failures: "schema／taxonomy／authority／context／oracle／path／digest／migration違反をgreenへ縮退しない。required trace 001..003の一部欠落を許可しない"
tdd_red_required: false
tdd_red_waiver_reason: "既存uncommitted sliceの引継ぎ時点でred timestamp receiptが存在しないため捏造しない。completion_claim_allowed=falseを維持し、targeted oracle・mutation観点・独立レビュー・CIで受入を閉じる"
complexity_effect: net_positive
complexity_justification: "新規schema validationコードは増えるが、単一moduleと薄いdoctor adapterへ閉じ、外部dependency・DB table・CLI・network経路を追加しない"
removal_trigger: "後継schemaへreceipt付きmigrationが完了し、v1 config／validator／doctor checkのconsumerが0になった時"
backprop_decision: not_required
backprop_decision_reason: "confirmed requirementsの001..003を実装するadditive sliceで、上位意味変更はない"
parent_design: docs/design/helix/L6-function-design/nfr-typed-registry-quality-taxonomy.md
pair_artifact: docs/test-design/helix/L8-nfr-typed-registry-quality-taxonomy-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/nfr-typed-registry-quality-taxonomy.md, oracle_id: U-NFRREG-001, test_path: tests/nfr-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/nfr-typed-registry-quality-taxonomy.md, oracle_id: U-NFRREG-017, test_path: tests/nfr-registry.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/nfr-typed-registry-quality-taxonomy.md, oracle_id: IT-NFRREG-001, test_path: tests/nfr-registry-doctor.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/nfr-typed-registry-quality-taxonomy.md, oracle_id: IT-NFRREG-002, test_path: tests/nfr-registry-doctor.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — typed schema／pure admission／doctor wiring実装" }
  - { role: qa, slot_label: "QA — U-NFRREG／IT-NFRREG oracleとmutation監査" }
  - { role: tl, slot_label: "TL — exact scope、current authority、独立review収束" }
generates:
  - { artifact_path: config/nfr-registry.json, artifact_type: config }
  - { artifact_path: src/requirements/nfr-registry.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/nfr-registry-check.ts, artifact_type: source_module }
  - { artifact_path: src/doctor/index.ts, artifact_type: source_module }
  - { artifact_path: tests/nfr-registry.test.ts, artifact_type: test_code }
  - { artifact_path: tests/nfr-registry-doctor.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-105-nfr-typed-registry-quality-taxonomy.md
  requires:
    - docs/plans/PLAN-L6-105-nfr-typed-registry-quality-taxonomy.md
  blocks:
    - issue:219
---

# NFR typed registry、migration admission、doctor gate の実装

Issue #219 の `HR-NFR-REG-001..003` を一つのatomic sliceで実装する。登録対象はまず同3要求の
3 entryに限定し、標準9特性／AI固有7特性のtaxonomy自体はenumとして全件を受理可能にする。

## 実装scope

- declaration: `config/nfr-registry.json`
- semantic boundary: `src/requirements/nfr-registry.ts`
- transactional read boundary: `src/doctor/nfr-registry-check.ts` と既存doctor registry
- verification: `tests/nfr-registry.test.ts`、`tests/nfr-registry-doctor.test.ts`

## 非対象

- #220 のmeasurement evaluation、threshold verdict、baseline更新。
- #221 のprobe execution、時系列・DB保存、scheduler。
- #223 のfinding disposition、Issue作成、GitHub mutation。

## 完了gate

対象tests、typecheck、format／lint、PLAN lint、diff check、independent cross-runtime review、
current-head CIをすべてgreenにする。証跡が揃うまで `completion_claim_allowed: false` を維持する。
