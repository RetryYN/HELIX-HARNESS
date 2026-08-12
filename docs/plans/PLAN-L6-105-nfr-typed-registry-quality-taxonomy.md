---
plan_id: PLAN-L6-105-nfr-typed-registry-quality-taxonomy
title: "PLAN-L6-105 (add-design): NFR registry validator と doctor admission の機能設計"
kind: add-design
layer: L6
drive: agent
status: draft
completion_claim_allowed: false
route_mode: add-feature
entry_signals: ["po_directive:Issue #219 の typed schema と migration admission を pure function／doctor境界へ降下する"]
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
contract_preconditions: "PLAN-L5-99 が helix-nfr-registry.v1、failure code、U-NFRREG-001..017を定義し、測定／probe／DBを非対象としている"
contract_postconditions: "analyzeNfrRegistry／parseNfrRegistry／admitNfrRegistryMigration／checkNfrRegistry の入力、出力、判定順序、source realpath境界、doctor配線を実装可能な粒度で固定する"
contract_invariants: "analyzerは入力を変更せず同一入力へ決定的結果を返す。filesystem readは明示repoRootのsource digest照合とdoctor config readだけ。network、command実行、DB書込み、threshold評価を行わない"
contract_failures: "invalid JSON、strict schema違反、partial required trace、unsafe／escaping source path、digest drift、migration不正を構造化failureとして返し、例外やwarning-onlyへ縮退しない"
tdd_red_required: false
tdd_red_waiver_reason: "kind=add-design。本 PLAN は機能設計であり、production codeとtestsの検証receiptはPLAN-L7-550へ記録する"
complexity_effect: net_negative
complexity_justification: "validationを単一pure module、doctor adapterを薄いread-only moduleへ分け、別parser・別digest・DB schemaを増やさない"
removal_trigger: "後継registry validatorが同等以上のexact schema・migration・doctor admissionを担い、全consumerが移行した時"
pair_artifact: docs/plans/PLAN-L7-550-nfr-typed-registry-quality-taxonomy.md
backprop_decision: not_required
backprop_decision_reason: "L5のschemaを関数境界へ降下する additive design で、上位の意味契約を変更しない"
agent_slots:
  - { role: se, slot_label: "SE — pure validator／migration admission／doctor adapter機能設計" }
  - { role: qa, slot_label: "QA — failure orderingとfilesystem境界oracle" }
  - { role: tl, slot_label: "TL — Node transactional boundaryと#220／#221非侵入監査" }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/nfr-typed-registry-quality-taxonomy.md, artifact_type: design_doc }
  - { artifact_path: docs/plans/PLAN-L7-550-nfr-typed-registry-quality-taxonomy.md, artifact_type: implementation_plan }
dependencies:
  parent: docs/plans/PLAN-L5-99-nfr-typed-registry-quality-taxonomy.md
  requires:
    - docs/plans/PLAN-L5-99-nfr-typed-registry-quality-taxonomy.md
  blocks:
    - docs/plans/PLAN-L7-550-nfr-typed-registry-quality-taxonomy.md
    - issue:219
---

# NFR registry validator と doctor admission の機能設計（L6/L7 pair）

## 目的

L5 schema を、pure analyzer、pure migration admission、薄い doctor adapter の3境界へ降ろす。
`config/nfr-registry.json` は declaration SSoT であり、doctor は構造妥当性を報告するだけで
測定結果や実行状態を書き込まない。

## 関数境界

| 関数 | 入力 | 成功 | 失敗 |
|---|---|---|---|
| `analyzeNfrRegistry` | unknown、任意repoRoot | typed registry | ordered failure codes/messages |
| `parseNfrRegistry` | analyzerと同一 | analyzer alias | analyzerと同一 |
| `admitNfrRegistryMigration` | previous、candidate、任意repoRoot | candidate | stable-ID／revision failure |
| `checkNfrRegistry` | repo root（対象root） | doctor OK message（成功通知） | missing／JSON／structural violation |

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | pure validatorとmigration admissionを実装 | [並列] | I/O責務混入0 |
| 2 | doctor adapterをregistryへ配線 | [並列] | missing／partialがfail-close |
| 3 | L8/L9 oracleを実行 | [直列] | targeted tests green |
| 4 | 独立レビュー | [review] | current HEAD blocker 0 |

本 PLAN は L7 実装の current-head review が完了するまで draft とする。
