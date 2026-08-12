---
plan_id: PLAN-L5-99-nfr-typed-registry-quality-taxonomy
title: "PLAN-L5-99 (add-design): NFR typed registry schema と migration admission の詳細設計"
kind: add-design
layer: L5
drive: agent
status: draft
completion_claim_allowed: false
route_mode: add-feature
entry_signals: ["po_directive:Issue #219 の L4 registry／taxonomy／authority 境界を typed schema へ降下する"]
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
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-73 が stable ID、16 quality characteristics、5 authority role、#220／#221 との責務境界を定義している"
contract_postconditions: "helix-nfr-registry.v1 の root／entry exact schema、discriminated union、path／digest制約、failure code順序、stable-ID migration admission、U-NFRREG-001..017 を固定する"
contract_invariants: "unknown fieldを黙って捨てない。unknown値はreason／reference付きで保持し測定済みに偽装しない。source digestは実bytesへ束縛する。material変更はrevisionをちょうど1進め、空revision bump・削除・逆行を拒否する"
contract_failures: "schema drift、family mismatch、authority混在、unsafe path、digest mismatch、無効sampling／threshold／SLO、stable ID削除、revision逆行・飛び越し・空bumpをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "kind=add-design。本 PLAN は L5/L8 pair のschemaとoracleを固定し、実測は PLAN-L7-550 が担う"
complexity_effect: net_negative
complexity_justification: "自由形式のNFR記述をexact schemaとdiscriminated unionへ限定し、migrationをpure comparisonへ閉じる"
removal_trigger: "helix-nfr-registry.v1 の後継schemaへreceipt付きmigrationが完了し、v1 consumerが0になった時"
pair_artifact: docs/test-design/helix/L8-nfr-typed-registry-quality-taxonomy-unit-test-design.md
backprop_decision: not_required
backprop_decision_reason: "L4で確定した境界を型とunit oracleへ具体化するだけで、上位要求を変更しない"
agent_slots:
  - { role: se, slot_label: "SE — exact schema、union、migration admission詳細化" }
  - { role: qa, slot_label: "QA — U-NFRREG-001..017とmutation観点" }
  - { role: tl, slot_label: "TL — authority／version／後続Issue境界監査" }
generates:
  - { artifact_path: docs/design/helix/L5-detail/nfr-typed-registry-quality-taxonomy.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-nfr-typed-registry-quality-taxonomy-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L4-73-nfr-typed-registry-quality-taxonomy.md
  requires:
    - docs/plans/PLAN-L4-73-nfr-typed-registry-quality-taxonomy.md
  blocks:
    - docs/plans/PLAN-L6-105-nfr-typed-registry-quality-taxonomy.md
    - issue:219
---

# NFR typed registry schema と migration admission の詳細設計（L5/L8 pair）

## 目的

L4 の責務境界を `helix-nfr-registry.v1` の exact schema、deterministic failure、pure migration
admission へ降ろす。L8 は各分岐へ到達する unit oracle を持ち、unknown field や partial declaration を
補完して成功させない。

## 設計判断

- entry は requirements v1.3 §4.3 の必須要素を省略不能な field として保持する。
- 未測定値は `unknown` union と reason／reference で表し、`0` や空文字へ変換しない。
- migration は stable ID を削除せず、material change のみ revision を1段進める。
- current source bytes の照合は candidate だけへ行い、過去snapshotのdigestを現行bytesで再評価しない。
- threshold の意味評価、probe の実行、evidence 保存は行わない。

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | root／entry／nested exact schemaを定義 | [直列] | 必須fieldとunionが一意 |
| 2 | authority／digest／migration admissionを定義 | [直列] | stable-ID version規則が決定的 |
| 3 | L8 unit oracleを実装契約へ束縛 | [直列] | U-NFRREG-001..017 orphan 0 |
| 4 | 独立レビュー | [review] | current HEAD blocker 0 |

本 PLAN は独立レビュー前の draft であり、green command だけで設計 freeze を主張しない。
