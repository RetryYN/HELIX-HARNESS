---
plan_id: PLAN-RECOVERY-106-mutation-oracle-locator-resolution
title: "PLAN-RECOVERY-106: mutation oracle locatorの解決と診断を是正する"
kind: recovery
layer: cross
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending
created: 2026-09-04
updated: 2026-09-04
owner: Codex / TL
github_issue_id: 1505
behavior_contract_id: MUTATION-ORACLE-LOCATOR-RESOLUTION-001
responsibility_owner: ddd-tdd-rules
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: policy
complexity_effect: net_neutral
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - regression_dev
contract_preconditions: "confirmed TDD PLANのmutation_oracle_evidenceは実在する反例の所在とkill/fail/red結果を示す必要があるが、oracle IDを既存test pathへ解決する導線がない"
contract_postconditions: "既存PLAN／test-designから解決可能なoracle_idをlocatorとして受理し、未解決IDとlocator欠落を受理形式付きで診断する"
contract_invariants: "mutation oracleの実体・kill signal・confirmed PLANの必須条件を緩和せず、derived locator inventoryを新しい意味authorityに昇格させない"
contract_failures: "placeholder、kill/fail/red signal欠落、未知oracle ID、未解決test path、inventory driftをfail-closeする"
tdd_red_required: true
mutation_oracle_required: true
backprop_decision: not_required
backprop_decision_reason: "既存DDD/TDD mutation-oracle契約のlocator解決と診断改善であり、新しい要求意味や受入条件を追加しない"
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-DDDTDD-012, test_path: tests/ddd-tdd-rules.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-DDDTDD-013, test_path: tests/ddd-tdd-rules.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-DDDTDD-014, test_path: tests/ddd-tdd-rules.test.ts }
dependencies:
  parent: docs/plans/PLAN-L7-463-engineering-discipline-contract.md
  requires:
    - docs/plans/PLAN-L7-463-engineering-discipline-contract.md
  references:
    - "issue:1505"
    - "issue:1489"
    - "issue:1504"
  blocks: []
agent_slots:
  - { role: aim, slot_label: "AIM — mutation oracle locator欠落の再発経路と既存authority境界の確認" }
  - { role: se, slot_label: "SE — 既存PLAN／test-designからのlocator導出" }
  - { role: qa, slot_label: "QA — unknown oracle IDと診断文の反例" }
  - { role: tl, slot_label: "TL — 既存mutation-oracle契約とauthority境界の確認" }
generates:
  - { artifact_path: docs/plans/PLAN-RECOVERY-106-mutation-oracle-locator-resolution.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/ddd-tdd-rules.ts, artifact_type: source_module }
  - { artifact_path: tests/ddd-tdd-rules.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/ddd-tdd-rules.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/templates/plan/impl/template.md, artifact_type: markdown_doc }
  - { artifact_path: docs/templates/plan/reverse/template.md, artifact_type: markdown_doc }
review_evidence: []
---

# PLAN-RECOVERY-106: mutation oracle locatorの解決と診断を是正する

## 目的

confirmed TDD PLANの `mutation_oracle_evidence` で、既存のoracle IDだけを記録した場合にも、
同じリポジトリのtest pathまたはL7/L8 test-designへ決定的に解決できるようにする。既存の
mutation実体、kill/fail/red signal、confirmed PLANの必須条件は維持する。

## 非対象

- 新しいmutation gate、別のoracle authority、別のCI jobを追加すること
- `#1489`／`#1504` の個別PLAN本文を、実体確認なしに書き換えること
- 未解決のoracle IDやplaceholder evidenceを受理すること
- test-designやPLANから導出したinventoryを永続的な意味正本にすること

## 実装方針

1. 既存PLANの `verification_bindings`／`generates` と既存test-design表からlocator inventoryを導出する。
2. `oracle_id → 実在test path／test-design文書` が解決できる場合だけ、明示locatorと同等に扱う。
3. 解決できないoracle ID、locator欠落、kill/fail/red signal欠落を別々に診断する。
4. 受理形式をPLAN template、DDD/TDD正本、canonical L8 test-designへ反映する。

## 完了条件

- [ ] U-DDDTDD-012〜014のpositive／negative／derived-inventoryテストがgreenになる。
- [ ] 明示path／`vitest` の既存受理経路が変わらない。
- [ ] unknown oracle IDはfail-closeし、受理形式とIDを診断する。
- [ ] 実リポジトリのDDD/TDD guard、typecheck、targeted test、全repo guardがgreenになる。
- [ ] current HEADのCIと独立review証跡を取得し、Issue #1505へread-afterを接続する。
